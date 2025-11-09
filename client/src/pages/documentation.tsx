import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Book, Code, Zap, Shield, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Documentation() {
  const curlExample = `curl -X POST https://your-app.replit.app/api/v1/chat/YOUR_PERSONA_ID \\
  -H "Content-Type: application/json" \\
  -d '{
    "apiKey": "YOUR_API_KEY",
    "message": "Hello, how can you help me?"
  }'`;

  const jsExample = `const response = await fetch('https://your-app.replit.app/api/v1/chat/YOUR_PERSONA_ID', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    apiKey: 'YOUR_API_KEY',
    message: 'Hello, how can you help me?'
  })
});

const data = await response.json();
console.log(data.message); // AI response
console.log(data.tokensUsed); // Token usage`;

  const pythonExample = `import requests

url = "https://your-app.replit.app/api/v1/chat/YOUR_PERSONA_ID"
payload = {
    "apiKey": "YOUR_API_KEY",
    "message": "Hello, how can you help me?"
}

response = requests.post(url, json=payload)
data = response.json()

print(data["message"])  # AI response
print(data["tokensUsed"])  # Token usage`;

  const nodeExpressExample = `const express = require('express');
const app = express();

app.post('/chat', async (req, res) => {
  try {
    const response = await fetch('https://your-app.replit.app/api/v1/chat/YOUR_PERSONA_ID', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: process.env.FORGE_AI_KEY,
        message: req.body.userMessage
      })
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to communicate with AI' });
  }
});`;

  const reactExample = `import { useState } from 'react';

function ChatComponent() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://your-app.replit.app/api/v1/chat/YOUR_PERSONA_ID', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: import.meta.env.VITE_FORGE_AI_KEY,
          message: message
        })
      });
      
      const data = await res.json();
      setResponse(data.message);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={sendMessage} disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </button>
      <div>{response}</div>
    </div>
  );
}`;

  const flaskExample = `from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')
    
    response = requests.post(
        'https://your-app.replit.app/api/v1/chat/YOUR_PERSONA_ID',
        json={
            'apiKey': os.environ.get('FORGE_AI_KEY'),
            'message': user_message
        }
    )
    
    return jsonify(response.json())`;

  const errorHandlingExample = `try {
  const response = await fetch('https://your-app.replit.app/api/v1/chat/YOUR_PERSONA_ID', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: 'YOUR_API_KEY', message: 'Hello' })
  });

  if (!response.ok) {
    const error = await response.json();
    
    if (response.status === 401) {
      console.error('Invalid API key');
    } else if (response.status === 403) {
      console.error('Persona not published or not found');
    } else if (response.status === 429) {
      console.error('Rate limit exceeded (60 requests/minute)');
    } else {
      console.error('Error:', error.message);
    }
    return;
  }

  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error('Network error:', error);
}`;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Book className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold" data-testid="text-docs-title">API Documentation</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Complete guide to integrating ForgeAI personas into your applications
        </p>
      </div>

      {/* Quick Start */}
      <Card data-testid="card-quick-start">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <CardTitle>Quick Start</CardTitle>
          </div>
          <CardDescription>Get up and running in 3 simple steps</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold shrink-0">
              1
            </div>
            <div>
              <h3 className="font-semibold mb-1">Create a Persona</h3>
              <p className="text-sm text-muted-foreground">
                Define your AI's behavior with intent descriptions and examples in the Create Persona page
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold shrink-0">
              2
            </div>
            <div>
              <h3 className="font-semibold mb-1">Generate an API Key</h3>
              <p className="text-sm text-muted-foreground">
                Go to API Keys page, create a new key, and link it to your persona
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold shrink-0">
              3
            </div>
            <div>
              <h3 className="font-semibold mb-1">Publish & Deploy</h3>
              <p className="text-sm text-muted-foreground">
                Click "Deploy" on your persona card, publish it, and copy your Persona ID
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoint */}
      <Card data-testid="card-api-endpoint">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            <CardTitle>API Endpoint</CardTitle>
          </div>
          <CardDescription>Send messages to your deployed personas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">POST</Badge>
              <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                /api/v1/chat/:personaId
              </code>
            </div>
            <p className="text-sm text-muted-foreground">
              Replace <code className="bg-muted px-1 rounded">:personaId</code> with your actual Persona ID
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Request Body</h4>
            <div className="bg-muted rounded-lg p-3 space-y-2 text-sm font-mono">
              <div>
                <span className="text-muted-foreground">{"{"}</span>
              </div>
              <div className="pl-4">
                <span className="text-primary">"apiKey"</span>
                <span className="text-muted-foreground">: </span>
                <span className="text-green-600">"string"</span>
                <span className="text-muted-foreground">, // Required: Your API key</span>
              </div>
              <div className="pl-4">
                <span className="text-primary">"message"</span>
                <span className="text-muted-foreground">: </span>
                <span className="text-green-600">"string"</span>
                <span className="text-muted-foreground"> // Required: User message</span>
              </div>
              <div>
                <span className="text-muted-foreground">{"}"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Response (200 OK)</h4>
            <div className="bg-muted rounded-lg p-3 space-y-2 text-sm font-mono">
              <div>
                <span className="text-muted-foreground">{"{"}</span>
              </div>
              <div className="pl-4">
                <span className="text-primary">"message"</span>
                <span className="text-muted-foreground">: </span>
                <span className="text-green-600">"string"</span>
                <span className="text-muted-foreground">, // AI's response</span>
              </div>
              <div className="pl-4">
                <span className="text-primary">"tokensUsed"</span>
                <span className="text-muted-foreground">: </span>
                <span className="text-blue-600">number</span>
                <span className="text-muted-foreground"> // Tokens consumed</span>
              </div>
              <div>
                <span className="text-muted-foreground">{"}"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card data-testid="card-code-examples">
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
          <CardDescription>Integration examples in multiple languages</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="curl" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="curl" data-testid="tab-curl">cURL</TabsTrigger>
              <TabsTrigger value="javascript" data-testid="tab-javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python" data-testid="tab-python">Python</TabsTrigger>
            </TabsList>
            <TabsContent value="curl" className="mt-4">
              <CodeBlock code={curlExample} language="bash" />
            </TabsContent>
            <TabsContent value="javascript" className="mt-4">
              <CodeBlock code={jsExample} language="javascript" />
            </TabsContent>
            <TabsContent value="python" className="mt-4">
              <CodeBlock code={pythonExample} language="python" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Framework Examples */}
      <Card data-testid="card-framework-examples">
        <CardHeader>
          <CardTitle>Framework Integration</CardTitle>
          <CardDescription>Examples for popular frameworks</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="react" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="react" data-testid="tab-react">React</TabsTrigger>
              <TabsTrigger value="express" data-testid="tab-express">Express.js</TabsTrigger>
              <TabsTrigger value="flask" data-testid="tab-flask">Flask</TabsTrigger>
            </TabsList>
            <TabsContent value="react" className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                React component with state management for chat interface
              </p>
              <CodeBlock code={reactExample} language="typescript" />
            </TabsContent>
            <TabsContent value="express" className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Express.js backend endpoint that proxies requests to ForgeAI
              </p>
              <CodeBlock code={nodeExpressExample} language="javascript" />
            </TabsContent>
            <TabsContent value="flask" className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Flask backend endpoint for Python applications
              </p>
              <CodeBlock code={flaskExample} language="python" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Error Handling */}
      <Card data-testid="card-error-handling">
        <CardHeader>
          <CardTitle>Error Handling</CardTitle>
          <CardDescription>Handle API errors gracefully</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Common Error Codes</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <Badge variant="destructive" className="shrink-0">401</Badge>
                <span className="text-muted-foreground">Invalid or missing API key</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Badge variant="destructive" className="shrink-0">403</Badge>
                <span className="text-muted-foreground">Persona not found or not published</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Badge variant="destructive" className="shrink-0">429</Badge>
                <span className="text-muted-foreground">Rate limit exceeded (60 requests/minute)</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Badge variant="destructive" className="shrink-0">500</Badge>
                <span className="text-muted-foreground">Internal server error</span>
              </div>
            </div>
          </div>
          <CodeBlock code={errorHandlingExample} language="javascript" />
        </CardContent>
      </Card>

      {/* Security Best Practices */}
      <Card data-testid="card-security">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle>Security Best Practices</CardTitle>
          </div>
          <CardDescription>Keep your API keys secure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Use Environment Variables</h4>
                <p className="text-sm text-muted-foreground">
                  Store API keys in environment variables, never hardcode them in your source code
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Backend Proxy Pattern</h4>
                <p className="text-sm text-muted-foreground">
                  Make API calls from your backend, not directly from frontend to keep keys hidden
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Rotate Keys Regularly</h4>
                <p className="text-sm text-muted-foreground">
                  Regenerate API keys periodically and after any potential exposure
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Use HTTPS Only</h4>
                <p className="text-sm text-muted-foreground">
                  Always make API requests over HTTPS to encrypt data in transit
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Monitor Usage</h4>
                <p className="text-sm text-muted-foreground">
                  Regularly check Analytics dashboard for unusual activity or unexpected usage patterns
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card data-testid="card-rate-limits">
        <CardHeader>
          <CardTitle>Rate Limits</CardTitle>
          <CardDescription>Understand API usage limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <div className="flex items-center gap-2">
                <Badge variant="default">60 requests/minute</Badge>
                <span className="text-sm">per API key across all personas</span>
              </div>
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">What happens when you hit the limit?</h4>
            <p className="text-sm text-muted-foreground">
              You'll receive a <code className="bg-muted px-1 rounded">429 Too Many Requests</code> response. 
              Implement exponential backoff in your application to handle rate limits gracefully.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Best practices:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Cache responses when possible</li>
              <li>Implement request queuing in your application</li>
              <li>Use multiple API keys for different services if needed</li>
              <li>Monitor your usage in the Analytics dashboard</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
