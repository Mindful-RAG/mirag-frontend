import { SidebarTrigger } from "@/components/ui/sidebar";

const AboutPage = () => {
  return (
    <>
      <header className="p-4 border-b">
        <div className="flex justify-between">
          <div className="flex items-center gap-x-2">
            <SidebarTrigger />
            <span className="font-semibold">About</span>
          </div>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">About Us</h1>
        <section className="mb-10">
          <p className="text-lg mb-4 font-bold">
            Mind the (Context) Gap: Reducing AI Hallucination by Bridging Long-Context Retrieval and Information Refinement through Mindful RAG
          </p>
          <p className="text-lg mb-4">
            MiRAG introduces a hybrid architecture that leverages the complementary strengths of <span className="font-bold">LongRAG</span> and <span className="font-bold">Corrective RAG</span> to minimize hallucinations by improving both retrieval and refinement processes.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-6">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-medium mb-2">Stephanie Palero</h3>
              <p className="text-gray-600">BS in Computer Science</p>
              <p className="text-gray-600">University of Mindanao</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-medium mb-2">Joshua Roi Nomus</h3>
              <p className="text-gray-600">BS in Computer Science</p>
              <p className="text-gray-600">University of Mindanao</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-medium mb-2">Denrei Keith De Jesus</h3>
              <p className="text-gray-600">BS in Computer Science</p>
              <p className="text-gray-600">University of Mindanao</p>
            </div>

          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;
