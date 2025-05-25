import BlogEntry from "@/lib/model/blog/BlogEntry";

// Next
import Link from "next/link";

const BlogCard: React.FC<{ blog: BlogEntry }> = ({ blog }) => {
  return (
    <div className="flex cursor-pointer flex-col">
      <Link className="group" href={`/blog/${blog.id}`} passHref>
        <div className="flex items-center justify-between">
          <span className="smooth-underline group-hover:smooth-underline-active text-2xl font-bold">
            {blog.title}
          </span>
          <span className="opacity-50">{blog.formattedDate}</span>
        </div>

        <div className="mt-2 text-justify">{blog.description}</div>
      </Link>
    </div>
  );
};

export default BlogCard;
