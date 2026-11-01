import { NextResponse } from 'next/server';

/**
 * AI Virtual Dressing Room (Try-On) API Route
 * Uses Replicate IDM-VTON (yisol/idm-vton)
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      human_image_url,
      garment_image_url,
      garment_description,
      daily_tryon_used = 0,
      vton_daily_limit = 3,
    } = body;

    // 1. Validation
    if (!human_image_url || typeof human_image_url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'কাস্টমারের ছবি (Human Image URL) প্রদান করুন।' },
        { status: 400 }
      );
    }

    if (!garment_image_url || typeof garment_image_url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'পোশাকের ছবি (Garment Image URL) প্রদান করুন।' },
        { status: 400 }
      );
    }

    // 2. Check Daily Limit
    const limit = Number(vton_daily_limit) || 3;
    const currentUsage = Number(daily_tryon_used) || 0;
    if (currentUsage >= limit) {
      return NextResponse.json(
        {
          success: false,
          error: `আপনার আজকের দৈনিক ট্রাই-অন লিমিট (${limit}/${limit}) পূর্ণ হয়েছে। অনুগ্রহ করে আগামীকাল আবার চেষ্টা করুন।`,
          limit_reached: true,
        },
        { status: 429 }
      );
    }

    // 3. Replicate API Token Check
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI Engine currently configured in standby mode.',
          standby: true,
          hint: 'To enable live inference, provide REPLICATE_API_TOKEN in environment variables.',
        },
        { status: 200 }
      );
    }

    // 4. Request Inference from Replicate (yisol/idm-vton)
    const replicateResponse = await fetch(
      'https://api.replicate.com/v1/models/yisol/idm-vton/predictions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
          Prefer: 'wait=60',
        },
        body: JSON.stringify({
          input: {
            human_img: human_image_url,
            garm_img: garment_image_url,
            garment_des: garment_description || 'fashion garment dress attire',
            crop: false,
            seed: 42,
          },
        }),
      }
    );

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text();
      console.error('Replicate API Error:', errorText);
      return NextResponse.json(
        {
          success: false,
          error: 'AI সার্ভার থেকে রেসপন্স পেতে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।',
          details: errorText,
        },
        { status: 502 }
      );
    }

    let prediction = await replicateResponse.json();

    // 5. Polling fallback if async processing exceeds initial wait
    if (
      prediction.status !== 'succeeded' &&
      prediction.status !== 'failed' &&
      prediction.urls?.get
    ) {
      const pollUrl = prediction.urls.get;
      const startTime = Date.now();
      const maxWaitMs = 50000; // 50 seconds max polling

      while (
        Date.now() - startTime < maxWaitMs &&
        prediction.status !== 'succeeded' &&
        prediction.status !== 'failed'
      ) {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        const pollRes = await fetch(pollUrl, {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        });
        if (pollRes.ok) {
          prediction = await pollRes.json();
        }
      }
    }

    // 6. Handle Succeeded Result
    if (prediction.status === 'succeeded' && prediction.output) {
      const outputUrl = Array.isArray(prediction.output)
        ? prediction.output[0]
        : prediction.output;

      return NextResponse.json({
        success: true,
        result_image_url: outputUrl,
        remaining_credits: Math.max(0, limit - (currentUsage + 1)),
        daily_limit: limit,
      });
    }

    // 7. Handle Failure
    return NextResponse.json(
      {
        success: false,
        error:
          prediction.error ||
          'পোশাকটি ট্রাই-অন প্রসেস করতে ব্যর্থ হয়েছে। অনুগ্রহ করে পরিষ্কার ও ফুল-বডি ছবি দিয়ে পুনরায় চেষ্টা করুন।',
      },
      { status: 422 }
    );
  } catch (error) {
    console.error('Try-On Route Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'সার্ভার ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
      },
      { status: 500 }
    );
  }
}
