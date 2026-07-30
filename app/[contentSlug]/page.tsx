import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CONTENT_PAGES } from "@/lib/content/pages";
import { getHome } from "@/lib/chibox";

type ContentPageProps = {
  params: Promise<{ contentSlug: string }>;
};

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const page = CONTENT_PAGES[(await params).contentSlug];
  return { title: page?.eyebrow ?? "Information" };
}

export default async function ContentPageRoute({ params }: ContentPageProps) {
  const { contentSlug } = await params;
  const page = CONTENT_PAGES[contentSlug];
  if (!page) notFound();

  // The live CMS confirms which structural page exists. Its brand copy is
  // intentionally never rendered.
  let liveSectionCount: number | undefined;
  try {
    const data = await getHome();
    liveSectionCount = data.pages.find(
      (shape) => shape.slug === contentSlug,
    )?.sectionCount;
  } catch {
    liveSectionCount = undefined;
  }

  return (
    <main id="main" className="content-page">
      <header>
        <p className="eyebrow">{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p>{page.intro}</p>
        <span>
          {String(liveSectionCount ?? page.sections.length).padStart(2, "0")}{" "}
          notes
        </span>
      </header>
      <div className="content-page__sections">
        {page.sections.map((section, index) => (
          <section key={section.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
