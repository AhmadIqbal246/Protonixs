import { getAllPosts } from "@/data/blog";
import PostListing from "@/components/blog/PostListing";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
    return (
        <div className="site-shell">
            <Navbar />
            <main className="site-main">
                <PostListing
                    title="Ideas and notes from Protonixs"
                    description="Articles about AI tools, web development, and technology, written from the work we do."
                    posts={getAllPosts()}
                    threeColumn
                />
            </main>
            <Footer />
        </div>
    );
}
