import fs from "fs";
import path from "path";

// Markdown
import matter from "gray-matter";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import { math, mathHtml } from "micromark-extension-math";

// Models
import { IBlogEntry } from "../model/blog/IBlogEntry";
import BlogEntry from "../model/blog/BlogEntry";

const blogDirectory = path.join(process.cwd(), "data/blog");

// Shamfully stolen from: https://nextjs.org/learn
export function getSortedBlogHeaders() {
  const fileNames = fs.readdirSync(blogDirectory);

  // filter out .ignore files
  return fileNames
    .filter((fileName) => !fileName.startsWith("."))
    .map((fileName) => {
      const fullPath = path.join(blogDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      const matterResult = { ...matter(fileContents).data } as IBlogEntry;
      return new BlogEntry(
        fileName.replace(/\.md$/, ""),
        matterResult.title,
        matterResult.date,
        matterResult.description,
      );
    })
    .sort(({ date: a }, { date: b }) => {
      return a > b ? 1 : -1;
    })
    .reverse();
}

export function getAllBlogIds() {
  const fileNames = fs.readdirSync(blogDirectory);
  return fileNames
    .filter((fileName) => !fileName.startsWith("."))
    .map((fileName) => {
      return {
        params: {
          id: fileName.replace(/\.md$/, ""),
        },
      };
    });
}

export async function getBlog(id: string) {
  const fullPath = path.join(blogDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const matterResult = { ...matter(fileContents).data } as IBlogEntry;
  return new BlogEntry(
    id,
    matterResult.title,
    matterResult.date,
    matterResult.description,
    micromark(matter(fileContents).content, {
      extensions: [gfm(), math()],
      htmlExtensions: [gfmHtml(), mathHtml()],
      allowDangerousHtml: true,
    }),
  );
}
