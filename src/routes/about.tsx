const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">About Us</h1>
      <section className="mb-10">
        <p className="text-lg mb-4">
          Welcome to our company! We are a dedicated team of professionals committed to
          delivering high-quality products and services to our clients.
        </p>
        <p className="text-lg mb-4">
          Founded in 2010, we have been at the forefront of innovation in our industry,
          constantly striving to improve and evolve with changing technologies and market demands.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="text-lg mb-6">
          To empower businesses through cutting-edge solutions that drive growth and success.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
        <p className="text-lg mb-4">
          To be the global leader in our field, recognized for excellence, innovation, and customer satisfaction.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-medium mb-2">Jane Doe</h3>
            <p className="text-gray-600">CEO & Founder</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-medium mb-2">John Smith</h3>
            <p className="text-gray-600">CTO</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-medium mb-2">Emily Johnson</h3>
            <p className="text-gray-600">Head of Operations</p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p className="mb-2">Email: info@ourcompany.com</p>
        <p className="mb-2">Phone: (123) 456-7890</p>
        <p>Address: 123 Business Street, City, State 12345</p>
      </section>
    </div>
  );
};

export default AboutPage;
