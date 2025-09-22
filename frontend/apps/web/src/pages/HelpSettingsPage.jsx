import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
// Converted to static frontend-only content

export default function HelpSettingsPage(){
  const faqs = [
    { id: 1, question: 'How do I report an issue?', answer: 'Go to the All Issues page and click “+ Report New Issue”. Fill in the details and submit.' },
    { id: 2, question: 'How can I track an issue status?', answer: 'Open “All Issues” and use search or filters to find the issue. The status is shown in the list.' },
    { id: 3, question: 'Who can resolve issues?', answer: 'Issues are handled by the appropriate municipal department based on category and ward.' },
  ];
  const manualUrl = '#';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-800">Help & Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Frequently Asked Questions (FAQ)</CardTitle></CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {faqs.map((f)=> (
                <AccordionItem key={f.id} value={`item-${f.id}`}>
                  <AccordionTrigger>{f.question}</AccordionTrigger>
                  <AccordionContent>{f.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>User Manual</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-600">Download the comprehensive guide to learn how to report, track, and resolve issues within GOV.CONNECT.</p>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <a href={manualUrl} target="_blank" rel="noreferrer">Download User Guide (PDF)</a>
            </Button>
            <div className="pt-6 text-sm text-neutral-500 space-x-4">
              <a className="underline" href="#">Terms of Service</a>
              <a className="underline" href="#">Privacy Policy</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


