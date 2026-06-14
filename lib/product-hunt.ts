const PRODUCT_HUNT_GRAPHQL_URL = "https://api.producthunt.com/v2/api/graphql";
const PRODUCT_HUNT_TIME_ZONE = "America/Los_Angeles";

const PRODUCT_HUNT_POSTS_QUERY = `
  query ProductHuntLaunches($first: Int!, $after: String, $postedAfter: DateTime!) {
    posts(
      first: $first
      after: $after
      featured: true
      order: VOTES
      postedAfter: $postedAfter
    ) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        name
        tagline
        description
        slug
        url
        website
        votesCount
        commentsCount
        reviewsCount
        reviewsRating
        dailyRank
        weeklyRank
        monthlyRank
        yearlyRank
        featuredAt
        createdAt
        thumbnail {
          url(width: 160, height: 160)
        }
        media {
          type
          url(width: 720, height: 360)
          videoUrl
        }
        productLinks {
          type
          url
        }
        user {
          id
          name
          username
          headline
          url
        }
        makers {
          id
          name
          username
          headline
          url
        }
        topics(first: 5) {
          nodes {
            id
            name
            slug
            url
            description
            followersCount
            postsCount
            image(width: 80, height: 80)
          }
        }
        collections(first: 3) {
          nodes {
            id
            name
            description
            url
            followersCount
          }
        }
        comments(first: 2, order: VOTES_COUNT) {
          nodes {
            id
            body
            votesCount
            url
            user {
              id
              name
              username
              url
            }
          }
        }
      }
    }
  }
`;

export type ProductHuntLaunch = {
  id: string;
  name: string;
  tagline: string;
  description: string | null;
  slug: string;
  url: string;
  website: string | null;
  votesCount: number;
  commentsCount: number;
  reviewsCount: number;
  reviewsRating: number;
  dailyRank: number | null;
  weeklyRank: number | null;
  monthlyRank: number | null;
  yearlyRank: number | null;
  featuredAt: string | null;
  createdAt: string;
  thumbnailUrl: string | null;
  media: ProductHuntMedia[];
  productLinks: ProductHuntProductLink[];
  user: ProductHuntPerson | null;
  makers: ProductHuntPerson[];
  topics: {
    id: string;
    name: string;
    slug: string;
    url: string;
    description: string;
    followersCount: number;
    postsCount: number;
    imageUrl: string | null;
  }[];
  collections: {
    id: string;
    name: string;
    description: string | null;
    url: string;
    followersCount: number;
  }[];
  comments: {
    id: string;
    body: string;
    votesCount: number;
    url: string;
    user: ProductHuntPerson | null;
  }[];
};

type ProductHuntPerson = {
  id: string;
  name: string;
  username: string;
  headline: string | null;
  url: string;
};

type ProductHuntMedia = {
  type: string;
  url: string;
  videoUrl: string | null;
};

type ProductHuntProductLink = {
  type: string;
  url: string;
};

type ProductHuntResult = {
  launches: ProductHuntLaunch[];
  totalCount: number;
  status: "ready" | "missing_token" | "error";
  errorMessage: string | null;
};

type ProductHuntGraphQLResponse = {
  data?: {
    posts?: {
      totalCount?: number;
      pageInfo?: {
        hasNextPage?: boolean;
        endCursor?: string | null;
      };
      nodes?: ProductHuntPostNode[];
    };
  };
  errors?: { message?: string }[];
};

type ProductHuntPostNode = {
  id?: string;
  name?: string;
  tagline?: string;
  description?: string | null;
  slug?: string;
  url?: string;
  website?: string | null;
  votesCount?: number;
  commentsCount?: number;
  reviewsCount?: number;
  reviewsRating?: number;
  dailyRank?: number | null;
  weeklyRank?: number | null;
  monthlyRank?: number | null;
  yearlyRank?: number | null;
  featuredAt?: string | null;
  createdAt?: string;
  thumbnail?: { url?: string | null } | null;
  media?: { type?: string; url?: string; videoUrl?: string | null }[];
  productLinks?: { type?: string; url?: string }[];
  user?: ProductHuntPersonNode | null;
  makers?: ProductHuntPersonNode[];
  topics?: {
    nodes?: {
      id?: string;
      name?: string;
      slug?: string;
      url?: string;
      description?: string;
      followersCount?: number;
      postsCount?: number;
      image?: string | null;
    }[];
  };
  collections?: {
    nodes?: {
      id?: string;
      name?: string;
      description?: string | null;
      url?: string;
      followersCount?: number;
    }[];
  };
  comments?: {
    nodes?: {
      id?: string;
      body?: string;
      votesCount?: number;
      url?: string;
      user?: ProductHuntPersonNode | null;
    }[];
  };
};

type ProductHuntPersonNode = {
  id?: string;
  name?: string;
  username?: string;
  headline?: string | null;
  url?: string;
};

export async function getProductHuntLaunches(limit = 24): Promise<ProductHuntResult> {
  const token = getProductHuntToken();
  if (!token) {
    return {
      launches: [],
      totalCount: 0,
      status: "missing_token",
      errorMessage: "Product Hunt token bulunamadı.",
    };
  }

  const postedAfter = getProductHuntDayStart();
  const pageSize = Math.min(Math.max(limit, 1), 20);

  try {
    const nodes: ProductHuntPostNode[] = [];
    let cursor: string | null = null;
    let totalCount = 0;

    for (let page = 0; page < 3 && nodes.length < limit; page += 1) {
      const response = await fetch(PRODUCT_HUNT_GRAPHQL_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: PRODUCT_HUNT_POSTS_QUERY,
          variables: {
            after: cursor,
            first: Math.min(pageSize, limit - nodes.length),
            postedAfter: postedAfter.toISOString(),
          },
        }),
        next: { revalidate: 900 },
      });

      if (!response.ok) {
        return {
          launches: [],
          totalCount: 0,
          status: "error",
          errorMessage: `Product Hunt API ${response.status} döndü.`,
        };
      }

      const payload = (await response.json()) as ProductHuntGraphQLResponse;
      if (payload.errors?.length) {
        return {
          launches: [],
          totalCount: 0,
          status: "error",
          errorMessage: payload.errors[0]?.message ?? "Product Hunt API hatası.",
        };
      }

      const posts = payload.data?.posts;
      const pageNodes = posts?.nodes ?? [];
      totalCount = posts?.totalCount ?? totalCount;
      nodes.push(...pageNodes);

      if (!posts?.pageInfo?.hasNextPage || !posts.pageInfo.endCursor) break;
      cursor = posts.pageInfo.endCursor;
    }

    const launches = nodes
      .map(normalizeLaunch)
      .filter(isProductHuntLaunch)
      .sort(compareProductHuntLaunches)
      .slice(0, limit);

    return {
      launches,
      totalCount: totalCount || nodes.length,
      status: "ready",
      errorMessage: null,
    };
  } catch (error) {
    return {
      launches: [],
      totalCount: 0,
      status: "error",
      errorMessage:
        error instanceof Error ? error.message : "Product Hunt API bağlantı hatası.",
    };
  }
}

function normalizeLaunch(node: ProductHuntPostNode): ProductHuntLaunch | null {
  const id = cleanText(node.id);
  const name = cleanText(node.name);
  const tagline = cleanText(node.tagline);
  const slug = cleanText(node.slug);
  const url = normalizeExternalUrl(node.url);
  if (!id || !name || !tagline || !slug || !url) return null;

  return {
    id,
    name,
    tagline,
    description: trimText(cleanText(node.description), 460),
    slug,
    url,
    website: normalizeExternalUrl(node.website),
    votesCount: node.votesCount ?? 0,
    commentsCount: node.commentsCount ?? 0,
    reviewsCount: node.reviewsCount ?? 0,
    reviewsRating: node.reviewsRating ?? 0,
    dailyRank: node.dailyRank ?? null,
    weeklyRank: node.weeklyRank ?? null,
    monthlyRank: node.monthlyRank ?? null,
    yearlyRank: node.yearlyRank ?? null,
    featuredAt: node.featuredAt ?? null,
    createdAt: node.createdAt ?? new Date().toISOString(),
    thumbnailUrl: node.thumbnail?.url ?? null,
    media: (node.media ?? [])
      .map((media) => ({
        type: media.type ?? "image",
        url: normalizeExternalUrl(media.url) ?? "",
        videoUrl: normalizeExternalUrl(media.videoUrl),
      }))
      .filter((media) => media.url),
    productLinks: (node.productLinks ?? [])
      .map((link) => ({
        type: link.type ?? "Link",
        url: normalizeExternalUrl(link.url) ?? "",
      }))
      .filter((link) => link.url),
    user: normalizePerson(node.user),
    makers: (node.makers ?? []).map(normalizePerson).filter(isProductHuntPerson),
    topics: (node.topics?.nodes ?? [])
      .map((topic) => ({
        id: topic.id ?? topic.slug ?? topic.name ?? "",
        name: topic.name ?? "",
        slug: topic.slug ?? "",
        url: normalizeExternalUrl(topic.url) ?? "https://www.producthunt.com/topics",
        description: trimText(cleanText(topic.description), 180) ?? "",
        followersCount: topic.followersCount ?? 0,
        postsCount: topic.postsCount ?? 0,
        imageUrl: topic.image ?? null,
      }))
      .filter((topic) => topic.name),
    collections: (node.collections?.nodes ?? [])
      .map((collection) => ({
        id: collection.id ?? collection.url ?? collection.name ?? "",
        name: collection.name ?? "",
        description: trimText(cleanText(collection.description), 180),
        url:
          normalizeExternalUrl(collection.url) ??
          "https://www.producthunt.com/collections",
        followersCount: collection.followersCount ?? 0,
      }))
      .filter((collection) => collection.id && collection.name),
    comments: (node.comments?.nodes ?? [])
      .map((comment) => ({
        id: comment.id ?? comment.url ?? "",
        body: trimText(cleanText(comment.body), 280) ?? "",
        votesCount: comment.votesCount ?? 0,
        url: normalizeExternalUrl(comment.url) ?? "https://www.producthunt.com/",
        user: normalizePerson(comment.user),
      }))
      .filter((comment) => comment.id && comment.body),
  };
}

function isProductHuntLaunch(
  launch: ProductHuntLaunch | null,
): launch is ProductHuntLaunch {
  return launch !== null;
}

function normalizePerson(node: ProductHuntPersonNode | null | undefined) {
  if (!node?.id && !node?.username && !node?.name) return null;
  const id = cleanText(node.id) ?? cleanText(node.username) ?? cleanText(node.name);
  const name = cleanText(node.name) ?? cleanText(node.username);
  const username = cleanText(node.username) ?? "";
  const url = normalizeExternalUrl(node.url);

  if (!id || !name || !url) return null;

  return {
    id,
    name,
    username,
    headline: cleanText(node.headline),
    url,
  };
}

function isProductHuntPerson(
  person: ProductHuntPerson | null,
): person is ProductHuntPerson {
  return person !== null;
}

function compareProductHuntLaunches(
  first: ProductHuntLaunch,
  second: ProductHuntLaunch,
) {
  if (first.dailyRank !== null && second.dailyRank !== null) {
    return first.dailyRank - second.dailyRank;
  }

  if (first.dailyRank !== null) return -1;
  if (second.dailyRank !== null) return 1;

  if (first.votesCount !== second.votesCount) {
    return second.votesCount - first.votesCount;
  }

  return getTimestamp(second.featuredAt ?? second.createdAt) -
    getTimestamp(first.featuredAt ?? first.createdAt);
}

function getTimestamp(value: string) {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getProductHuntDayStart(referenceDate = new Date()) {
  const parts = getDatePartsInTimeZone(referenceDate, PRODUCT_HUNT_TIME_ZONE);
  return getUtcDateForTimeZoneMidnight(
    parts.year,
    parts.month,
    parts.day,
    PRODUCT_HUNT_TIME_ZONE,
  );
}

function getDatePartsInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);

  return {
    day: Number(parts.find((part) => part.type === "day")?.value ?? "1"),
    month: Number(parts.find((part) => part.type === "month")?.value ?? "1"),
    year: Number(parts.find((part) => part.type === "year")?.value ?? "1970"),
  };
}

function getUtcDateForTimeZoneMidnight(
  year: number,
  month: number,
  day: number,
  timeZone: string,
) {
  const utcGuess = Date.UTC(year, month - 1, day);
  const firstPass = utcGuess - getTimeZoneOffsetMs(new Date(utcGuess), timeZone);
  const secondOffset = getTimeZoneOffsetMs(new Date(firstPass), timeZone);
  return new Date(utcGuess - secondOffset);
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);

  const valueByType = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  const asUtc = Date.UTC(
    Number(valueByType.year),
    Number(valueByType.month) - 1,
    Number(valueByType.day),
    Number(valueByType.hour),
    Number(valueByType.minute),
    Number(valueByType.second),
  );

  return Math.round((asUtc - date.getTime()) / 1000) * 1000;
}

function cleanText(value: string | null | undefined) {
  if (!value) return null;

  const cleaned = value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || isRedactedValue(cleaned)) return null;
  return cleaned;
}

function trimText(value: string | null, maxLength: number) {
  if (!value) return null;
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
}

function normalizeExternalUrl(value: string | null | undefined) {
  const cleaned = cleanText(value);
  if (!cleaned) return null;

  try {
    const url = new URL(cleaned);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function isRedactedValue(value: string) {
  return value.trim().toUpperCase() === "[REDACTED]";
}

function getProductHuntToken() {
  return (
    process.env.PRODUCT_HUNT_TOKEN ??
    process.env.PRODUCT_HUNT_API_TOKEN ??
    process.env.PRODUCTHUNT_TOKEN ??
    process.env.PH_TOKEN ??
    ""
  ).trim();
}
