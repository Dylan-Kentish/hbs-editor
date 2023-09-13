'use client';

import CompiledRenderer from '@/components/CompliedRenderer';
import { parseHBSTemplate } from '@/lib/parse';
import { toString } from '@/lib/string';
import Handlebars from 'handlebars';
import { useState } from 'react';
import { z } from 'zod';

const defaultTemplate = `
<!DOCTYPE html>
<html>
<head>
  <title>Order Confirmation</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      background-color: #f7f7f7;
      margin: 20px;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: #333;
      margin-bottom: 30px;
      text-align: center;
    }

    h2 {
      color: #555;
    }

    .product-card {
      display: flex;
      border: 1px solid #ddd;
      margin-bottom: 20px;
      padding: 10px;
      border-radius: 4px;
      gap: 10px;
    }

    .product-image {
      flex: 0 0 100px;
      margin-right: 10px;
    }

    .product-image img {
      width: auto;
      aspect-ratio: 1/1;
      height: 100%;
      border-radius: 4px;
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
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    th {
      background-color: #f2f2f2;
    }

    p {
      margin-bottom: 10px;
    }

    .shipping-address, .payment-method {
      border-top: 1px solid #ddd;
      padding-top: 20px;
      margin-top: 20px;
    }

    .thank-you {
      text-align: center;
      margin-top: 30px;
    }

    .order-button {
      display: inline-block;
      background-color: #007BFF;
      color: #ffffff;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 4px;
      transition: background-color 0.3s ease;
    }

    .order-button:hover {
      background-color: #0056b3;
    }
  </style>
</head>
<body>
  <div class="container">
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

    <div class="shipping-address">
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
    </div>

    <div class="payment-method">
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
    </div>

    <p class="thank-you">
      Thank you for your order! If you have any questions or concerns, please don't hesitate to contact our customer support.
    </p>

    <p style="text-align: center;">
      <a class="order-button" href="https://example.com/orders/{{orderId}}" target="_blank" rel="noopener noreferrer">View Order Details</a>
    </p>
  </div>
</body>
</html>
`

const defaultData = `
{
  "products": [
    {
      "name": "Product A",
      "quantity": "2",
      "price": "$25.99",
      "image": "https://via.placeholder.com/150"
    },
    {
      "name": "Product B",
      "quantity": "1",
      "price": "$19.95",
      "image": "https://via.placeholder.com/150"
    },
    {
      "name": "Product C",
      "quantity": "3",
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
  },
  "orderId": "1234567890"
}
`

function update(template: string, data: string) {
  try{
    const parsedJSON = JSON.parse(data);
    return Handlebars.compile(template)(parsedJSON);
  } catch (e) {
    console.error(e)
    return null;
  }
}

function checkTypeEquality(template: string, data: string): boolean {
  try{
    const parsedJSON = JSON.parse(data);
    const schema = parseHBSTemplate(template)

    if (schema === null) {
      return false;
    }

    return schema.safeParse(parsedJSON).success;
  } catch (e) {
    console.error(e)
    return false;
  }
}

export default function Home() {
  const [template, setTemplate] = useState<string>(defaultTemplate)
  const [data, setData] = useState<string>(defaultData)
  const [compiled, setCompiled] = useState<string | null>(update(template, data))
  const [typesEqual, setTypesEqual] = useState<boolean | undefined>(true)

  function handleTemplateChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setTemplate(event.target.value)

    const compiled = update(event.target.value, data);

    if (compiled !== null) {
      setTypesEqual(checkTypeEquality(event.target.value, data))
    } else {
      setTypesEqual(undefined)
    }

    setCompiled(compiled)
  }

  function handleDataChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setData(event.target.value)

    const compiled = update(template, event.target.value);

    if (compiled !== null) {
      setTypesEqual(checkTypeEquality(template, event.target.value))
    } else {
      setTypesEqual(undefined)
    }

    setCompiled(compiled)
  }

  return (
    <main className="flex grow h-screen p-5 gap-5">
      <div className="flex grow flex-col justify-center gap-5">
        <h1 className="text-4xl font-bold text-center ">Handlebars template</h1>
        <textarea className="flex grow text-black resize-none rounded-md" spellCheck={false} value={template} onChange={handleTemplateChange} />
        <h1 className="text-4xl font-bold text-center">Handlebars data</h1>
        <textarea 
          className={`flex grow text-black resize-none rounded-md
            ${typesEqual === true ? 'bg-green-200' : typesEqual === false ? 'bg-red-200' : 'bg-orange-200'}`} 
          spellCheck={false} 
          value={data} 
          onChange={handleDataChange} />
      </div>
      <div className="flex grow flex-col gap-5">
        <h1 className="text-4xl font-bold text-center ">Compiled result</h1>
        <div className="h-full border-2 border-white bg-white">
          <CompiledRenderer compiledHTML={compiled} />
        </div>
      </div>
    </main>
  )
}
