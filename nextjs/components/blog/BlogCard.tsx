import Link from 'next/link';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  published_at?: string;
  author?: {
    id: number;
    username: string;
    email: string;
  };
}

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all group cursor-pointer h-full flex flex-col">
        {post.featured_image && (
          <div className="relative h-48 bg-gray-900 overflow-hidden">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-bold mb-3 group-hover:text-[#F66F00] transition-colors line-clamp-2">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-1">
              {post.excerpt}
            </p>
          )}
          <div className="mt-auto pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between text-gray-500 text-xs">
              {post.author && (
                <span>Tác giả: {post.author.username}</span>
              )}
              {post.published_at && (
                <span>{formatDate(post.published_at)}</span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
