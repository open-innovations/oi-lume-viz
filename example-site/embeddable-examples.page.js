// Set the layout for the example page
export const layout = 'layout/example.njk';

const sanitiser = (s) => s.replace(/\W+/g, '-').toLowerCase();

export default function* ({ search }) {
  // Search for pages tagged sample
  const samples = search.pages('sample');

  // Iterate over each sample page found
  for (const sample of samples) {
    // Set the index to be 1
    let index = 1;
    // Grab the page url, component, example and title (as sampleTitle)
    const { url, component, examples, title: parentTitle } = sample;
    // Iterate over each example
    for (const example of examples) {
      // Grab the title, description and config from the example
      const { title, description, config } = example;
      // Yield an object from the generator function
      // This creates a new page, filling the defined layout with the yielded context
      yield {
        url: `${url}embed/${sanitiser(title)}/`,
        title: title,
        parent: { title: parentTitle, url: url },
        description,
        component,
        config,
        index: index++,
      }
    }
  }
}
