import { NextResponse } from 'next/server';
import { seedNodes } from '@/lib/seedData';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username || typeof username !== 'string' || username.trim() === '') {
      return NextResponse.json({ error: 'Please provide a valid LeetCode username.' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Query LeetCode's Public GraphQL API for Recent Accepted Submissions
    const query = `
      query userRecentAcSubmissions($username: String!, $limit: Int!) {
        recentAcSubmissionList(username: $username, limit: $limit) {
          title
          titleSlug
          timestamp
        }
      }
    `;

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://leetcode.com',
      },
      body: JSON.stringify({
        query,
        variables: { username: cleanUsername, limit: 100 },
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `LeetCode API returned status ${response.status}. Please verify the username.` },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (data.errors && data.errors.length > 0) {
      return NextResponse.json(
        { error: data.errors[0].message || 'Failed to fetch LeetCode profile.' },
        { status: 400 }
      );
    }

    const submissions = data?.data?.recentAcSubmissionList || [];

    if (!Array.isArray(submissions)) {
      return NextResponse.json(
        { error: 'Invalid response format received from LeetCode.' },
        { status: 502 }
      );
    }

    // Extract unique accepted problem titleSlugs from LeetCode
    const acceptedSlugs = new Set<string>();
    submissions.forEach((sub: any) => {
      if (sub.titleSlug) {
        acceptedSlugs.add(sub.titleSlug.toLowerCase());
      }
    });

    // Map matched LeetCode titleSlugs to our DSA Graph Node UUID IDs
    const matchedNodeIds: string[] = [];
    const matchedSlugs: string[] = [];

    seedNodes.forEach(node => {
      const nodeSlugLower = node.slug.toLowerCase();
      if (acceptedSlugs.has(nodeSlugLower)) {
        matchedNodeIds.push(node.id);
        matchedSlugs.push(node.slug);
      }
    });

    return NextResponse.json({
      success: true,
      username: cleanUsername,
      totalAcFetched: submissions.length,
      matchedCount: matchedNodeIds.length,
      matchedNodeIds,
      matchedSlugs,
    });
  } catch (error: any) {
    console.error('LeetCode sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while syncing LeetCode.' },
      { status: 500 }
    );
  }
}
