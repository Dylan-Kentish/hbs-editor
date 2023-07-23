import React, { useMemo } from 'react';

const CompiledRenderer: React.FC<{ compiledHTML: string | null }> = ({ compiledHTML }) => {
  const dataURI = useMemo(() => compiledHTML ? `data:text/html;charset=utf-8,${encodeURIComponent(compiledHTML)}` : null, [compiledHTML]);

  return dataURI ? <iframe title="Handlebars Template" src={dataURI} width="100%" height="100%" /> : null;
};

export default CompiledRenderer;
