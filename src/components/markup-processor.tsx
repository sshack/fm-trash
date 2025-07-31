const MarkupProcessor = {
  p: (props: any) => (
    <p
      className="body-small-regular text-gray-light-600 dark:text-gray-dark-400 mb-[14px]"
      {...props}
    />
  ),
  h1: (props: any) => <h1 className="body-extra-large-bold mb-2" {...props} />,
  h2: (props: any) => <h2 className="body-large-bold mb-2" {...props} />,
  h3: (props: any) => <h3 className="body-medium-semibold mb-2" {...props} />,
  h4: (props: any) => <h4 className="body-small-semibold mb-2" {...props} />,
  h5: (props: any) => (
    <h5 className="body-extra-small-semibold mb-2" {...props} />
  ),
  h6: (props: any) => <h6 className="body-tiny-semibold mb-2" {...props} />,
  strong: (props: any) => (
    <strong className="body-small-semibold mb-2" {...props} />
  ),
  u: (props: any) => <u className="underline mb-2" {...props} />,
  ul: (props: any) => (
    <ul
      className="list-disc pl-5 body-small-regular mb-0 last:mb-2 text-gray-light-600 dark:text-gray-dark-400"
      {...props}
    />
  ),
  ol: (props: any) => (
    <ol
      className="list-decimal pl-5 body-small-regular mb-0 last:mb-2 text-gray-light-600 dark:text-gray-dark-400"
      {...props}
    />
  ),
  li: (props: any) => (
    <li
      className="body-small-regular mb-0 last:mb-2 text-gray-light-600 dark:text-gray-dark-400"
      {...props}
    />
  ),

  blockquote: (props: any) => (
    <blockquote className="border-l-4 pl-4 border-l-gray-light-300 dark:border-l-gray-dark-700 space-y-0">
      <span
        className="italic text-gray-light-600 dark:text-gray-dark-400"
        {...props}
      />
    </blockquote>
  ),

  a: (props: any) => (
    <a
      className="underline mb-2 text-gray-light-600 hover:text-gray-light-700 dark:text-gray-dark-400 hover:dark:text-gray-dark-300 transition-colors duration-300"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),

  code: (props: any) => {
    const content = props.children || '';

    const isSingleLine =
      typeof content === 'string' && content.trim().split('\n').length === 1;

    return (
      <code
        className={`${
          isSingleLine
            ? 'bg-gray-light-100 dark:bg-gray-dark-800 border border-gray-light-300 dark:border-gray-dark-700 py-0 px-1 rounded-[4px] text-gray-light-700 dark:text-gray-dark-300 body-small-regular !font-mono'
            : ''
        }`}
      >
        {props.children}
      </code>
    );
  },

  pre: (props: any) => (
    <pre
      className="bg-gray-light-100 dark:bg-gray-dark-800 border border-gray-light-200 dark:border-gray-dark-800 py-4 px-5 rounded-xl overflow-x-auto mb-2 text-gray-light-700 dark:text-gray-dark-300 body-small-regular !font-mono"
      {...props}
    />
  ),
  hr: () => (
    <hr className="border-gray-light-300 dark:border-gray-dark-700 mb-2" />
  ),
};

export default MarkupProcessor;
