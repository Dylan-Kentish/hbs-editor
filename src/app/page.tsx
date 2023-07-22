'use client';

import Handlebars from 'handlebars';
import { useState } from 'react';

const defaultTemplate = `
<!DOCTYPE html>
<html>
<head>
  <title>Order Confirmation</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
    }
    h1, h2 {
      color: #555;
    }
    .product-card {
      display: flex;
      border: 1px solid #ccc;
      margin-bottom: 20px;
      padding: 10px;
    }
    .product-image {
      width: 100px;
      height: 100px;
      margin-right: 10px;
    }
    .product-details {
      flex: 1;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #ccc;
    }
    th {
      background-color: #f2f2f2;
    }
    p {
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <h1>Order Confirmation</h1>
  
  <h2>Order Summary</h2>
  {{#each products}}
  <div class="product-card">
    <div class="product-image">
      <img src="{{this.image}}" alt="{{this.name}}">
    </div>
    <div class="product-details">
      <p><strong>{{this.name}}</strong></p>
      <p>Quantity: {{this.quantity}}</p>
      <p>Price: {{this.price}}</p>
    </div>
  </div>
  {{/each}}

  <h2>Shipping Address</h2>
  <p>
    {{shippingAddress.name}}
    <br>
    {{shippingAddress.address}}
    <br>
    {{shippingAddress.city}}, {{shippingAddress.state}} {{shippingAddress.zip}}
    <br>
    {{shippingAddress.country}}
  </p>

  <h2>Payment Method</h2>
  <p>
    Payment Method: {{paymentMethod.type}}
    <br>
    Cardholder Name: {{paymentMethod.cardholderName}}
    <br>
    Card Number: **** **** **** {{paymentMethod.last4}}
    <br>
    Expiry Date: {{paymentMethod.expiryDate}}
  </p>

  <p>
    Thank you for your order! If you have any questions or concerns, please don't hesitate to contact our customer support.
  </p>
</body>
</html>

`

const defaultData = `
{
  "products": [
    {
      "name": "Product A",
      "quantity": 2,
      "price": "$25.99",
      "image": "https://via.placeholder.com/150"
    },
    {
      "name": "Product B",
      "quantity": 1,
      "price": "$19.95",
      "image": "https://via.placeholder.com/150"
    },
    {
      "name": "Product C",
      "quantity": 3,
      "price": "$12.49",
      "image": "https://via.placeholder.com/150"
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "address": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip": "12345",
    "country": "United States"
  },
  "paymentMethod": {
    "type": "Credit Card",
    "cardholderName": "John Doe",
    "last4": "7890",
    "expiryDate": "09/25"
  }
}
`

function update(template: string, data: string) {
  try{
    return Handlebars.compile(template)(JSON.parse(data))
  } catch (e) {
    console.error(e)
    return null;
  }
}

export default function Home() {
  const [template, setTemplate] = useState<string>(defaultTemplate)
  const [data, setData] = useState<string>(defaultData)
  const [compiled, setCompiled] = useState<string | null>(update(template, data))

  function handleTemplateChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setTemplate(event.target.value)
    setCompiled(update(event.target.value, data))
  }

  function handleDataChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setData(event.target.value)
    setCompiled(update(template, event.target.value))
  }

  return (
    <main className="flex grow h-screen p-5 gap-5">
      <div className="flex grow flex-col justify-center gap-5">
        <h1 className="text-4xl font-bold text-center ">Handlebars template</h1>
        <textarea className="flex grow text-black resize-none" spellCheck={false} value={template} onChange={handleTemplateChange} />
        <h1 className="text-4xl font-bold text-center">Handlebars data</h1>
        <textarea className="flex grow text-black resize-none" spellCheck={false} value={data} onChange={handleDataChange} />
      </div>
      <div className="flex grow flex-col gap-5">
        <h1 className="text-4xl font-bold text-center ">Compiled result</h1>
        <div className="h-full p-5 border-2 border-white" dangerouslySetInnerHTML={{__html: compiled ?? ''}} />
      </div>
    </main>
  )
}
