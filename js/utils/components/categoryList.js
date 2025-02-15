// js/utils/components/categoryList.js

export default function CategoryList({categories}) {
    return `
    <section class="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">Event Categories</h2>
      <div class="flex flex-wrap gap-2">
        ${categories.map(category => `
          <a
            href="../../../pages/candidates.html?category=${category.id}"
            class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition duration-300"
          >
            ${category.name}
          </a>
        `).join('')}
      </div>
    </section>
  `;
}