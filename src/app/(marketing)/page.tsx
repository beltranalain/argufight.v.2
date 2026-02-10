import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/server/db/prisma";

interface HomepageSection {
  id: string;
  key: string;
  title: string | null;
  content: string | null;
  order: number;
  is_visible: boolean;
  contact_email: string | null;
  homepage_images: Array<{
    id: string;
    url: string;
    alt: string | null;
    caption: string | null;
    link_url: string | null;
    order: number;
  }>;
  homepage_buttons: Array<{
    id: string;
    text: string;
    url: string | null;
    variant: string;
    order: number;
    is_visible: boolean;
  }>;
}

async function getHomepageSections(): Promise<HomepageSection[]> {
  try {
    const sections = await prisma.homepage_sections.findMany({
      where: { is_visible: true },
      include: {
        homepage_images: { orderBy: { order: "asc" } },
        homepage_buttons: {
          where: { is_visible: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });
    return sections as unknown as HomepageSection[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const sections = await getHomepageSections();
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <>
      {/* Hero Section */}
      {sortedSections.find((s) => s.key === "hero" && s.is_visible) && (
        <HeroSection
          section={sortedSections.find((s) => s.key === "hero" && s.is_visible)!}
        />
      )}

      {/* Content Sections */}
      <div className="pt-20 pb-32">
        {sortedSections
          .filter(
            (s) =>
              s.key !== "hero" &&
              s.key !== "footer" &&
              s.key !== "app-download" &&
              s.is_visible
          )
          .map((section, index) => (
            <ContentSection key={section.id} section={section} index={index} />
          ))}
      </div>

      {/* App Download Section */}
      {sortedSections.find((s) => s.key === "app-download" && s.is_visible) && (
        <AppDownloadSection
          section={sortedSections.find((s) => s.key === "app-download" && s.is_visible)!}
        />
      )}
    </>
  );
}

function HeroSection({ section }: { section: HomepageSection }) {
  const primaryButton = section.homepage_buttons.find(
    (btn) => btn.variant === "primary" && btn.is_visible
  );
  const secondaryButton = section.homepage_buttons.find(
    (btn) => btn.variant === "secondary" && btn.is_visible
  );

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {section.title && (
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
            {section.title}
          </h1>
        )}
        {section.content && (
          <div
            className="text-xl md:text-2xl text-white/90 mb-10 max-w-none"
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {primaryButton && (
            <Link
              href={primaryButton.url || "/signup"}
              className="px-8 py-4 bg-[#00d9ff] text-black rounded-xl font-semibold text-lg hover:bg-[#00B8E6] transition-all transform hover:scale-105 shadow-lg shadow-[#00d9ff]/50"
            >
              {primaryButton.text}
            </Link>
          )}
          {secondaryButton && (
            <Link
              href={secondaryButton.url || "/login"}
              className="px-8 py-4 border-2 border-[#00d9ff] text-[#00d9ff] rounded-xl font-semibold text-lg hover:bg-[#00d9ff]/10 transition-all transform hover:scale-105"
            >
              {secondaryButton.text}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function ContentSection({
  section,
  index,
}: {
  section: HomepageSection;
  index: number;
}) {
  const sectionImages = [...section.homepage_images].sort(
    (a, b) => a.order - b.order
  );
  const sectionButtons = section.homepage_buttons
    .filter((btn) => btn.is_visible)
    .sort((a, b) => a.order - b.order);

  const isImageRight = index % 2 === 0;
  const primaryImage = sectionImages[0];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl border border-white/20 bg-purple-900/30 backdrop-blur-md p-8 md:p-12 shadow-2xl">
          <div
            className={`grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center ${
              isImageRight ? "" : "lg:grid-flow-dense"
            }`}
          >
            {/* Image Block */}
            {primaryImage && (
              <div className={`relative ${isImageRight ? "lg:order-2" : "lg:order-1"}`}>
                <div className="relative min-h-[300px] rounded-2xl overflow-hidden border border-white/20">
                  {primaryImage.url.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={primaryImage.url}
                      alt={primaryImage.alt || section.title || ""}
                      className="w-full h-auto object-contain"
                    />
                  ) : (
                    <div className="relative w-full" style={{ aspectRatio: "auto" }}>
                      <Image
                        src={primaryImage.url}
                        alt={primaryImage.alt || section.title || ""}
                        width={800}
                        height={600}
                        className="w-full h-auto object-contain"
                        priority={index === 0}
                        unoptimized={
                          primaryImage.url.includes("blob.vercel-storage.com") ||
                          primaryImage.url.startsWith("data:")
                        }
                      />
                    </div>
                  )}
                  {primaryImage.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3 text-white text-sm">
                      {primaryImage.caption}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Content Block */}
            <div className={`flex flex-col justify-center ${isImageRight ? "lg:order-1" : "lg:order-2"}`}>
              {section.title && (
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  {section.title}
                </h2>
              )}
              {section.content && (
                <div
                  className="text-base md:text-lg text-white/90 mb-8 prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              )}
              {sectionButtons.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {sectionButtons.map((button) => (
                    <Link
                      key={button.id}
                      href={button.url || "#"}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                        button.variant === "primary"
                          ? "bg-[#00d9ff] text-black hover:bg-[#00B8E6] shadow-lg shadow-[#00d9ff]/50"
                          : "border-2 border-[#00d9ff] text-[#00d9ff] hover:bg-[#00d9ff]/10"
                      }`}
                    >
                      {button.text}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Images Grid */}
        {sectionImages.length > 1 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
            {sectionImages.slice(1).map((image) => (
              <div
                key={image.id}
                className="relative rounded-xl overflow-hidden border border-white/20"
              >
                {image.url.includes("blob.vercel-storage.com") ||
                image.url.startsWith("data:") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image.url}
                    alt={image.alt || ""}
                    className="w-full h-auto object-contain"
                  />
                ) : (
                  <Image
                    src={image.url}
                    alt={image.alt || ""}
                    width={400}
                    height={400}
                    className="w-full h-auto object-contain"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function AppDownloadSection({ section }: { section: HomepageSection }) {
  const sortedImages = [...section.homepage_images].sort(
    (a, b) => a.order - b.order
  );
  const appStoreImage = sortedImages[0];
  const googlePlayImage = sortedImages[1];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl border border-white/20 bg-purple-900/30 backdrop-blur-md p-8 md:p-12 shadow-2xl text-center">
          {section.title && (
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              {section.title}
            </h2>
          )}
          {section.content && (
            <div
              className="text-base md:text-lg text-white/90 mb-10 max-w-none"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          )}

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {appStoreImage && (
              <Link
                href={appStoreImage.link_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all transform hover:scale-105"
              >
                <div className="relative w-48 h-14 md:w-56 md:h-16">
                  <Image
                    src={appStoreImage.url}
                    alt={appStoreImage.alt || "Download on the App Store"}
                    fill
                    className="object-contain"
                  />
                </div>
              </Link>
            )}
            {googlePlayImage && (
              <Link
                href={googlePlayImage.link_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all transform hover:scale-105"
              >
                <div className="relative w-48 h-14 md:w-56 md:h-16">
                  <Image
                    src={googlePlayImage.url}
                    alt={googlePlayImage.alt || "Get it on Google Play"}
                    fill
                    className="object-contain"
                  />
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
