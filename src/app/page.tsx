'use client';

import Handlebars from 'handlebars';
import { useState } from 'react';

const defaultTemplate = `
  <h1>{{title}}</h1>
  <ul>
    {{#each items}}
      <li>{{this}}</li>

      {{#if @last}}
        <li>last item</li>
      {{/if}}
    {{/each}}
  </ul>
`

const defaultData = `
  {
    "title": "My new post",
    "items": [
      "foo",
      "bar",
      "baz"
    ]
  }
`

function update(template: string, data: string) {
  const compiled = Handlebars.compile(template)(JSON.parse(data))
  return compiled
}

export default function Home() {
  const [template, setTemplate] = useState<string>(defaultTemplate)
  const [data, setData] = useState<string>(defaultData)
  const [compiled, setCompiled] = useState<string>(update(template, data))

  function handleTemplateChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setTemplate(event.target.value)
    setCompiled(update(event.target.value, data))
  }

  function handleDataChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setData(event.target.value)
    setCompiled(update(template, event.target.value))
  }

  return (
    <main className="flex grow h-screen">
      <div className="flex grow flex-col justify-center gap-5">
        <h1 className="text-4xl font-bold text-center ">Handlebars template</h1>
        <textarea className="flex grow text-black" value={template} onChange={handleTemplateChange} />
        <h1 className="text-4xl font-bold text-center">Handlebars data</h1>
        <textarea className="flex grow text-black" value={data} onChange={handleDataChange} />
      </div>
      <div className="flex grow">
        <div dangerouslySetInnerHTML={{__html: compiled}} />
      </div>
    </main>
  )
}
