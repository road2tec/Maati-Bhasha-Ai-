
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks } from 'lucide-react';

interface DebugViewProps {
  appliedRules: string[];
}

export default function DebugView({ appliedRules }: DebugViewProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ListChecks className="h-5 w-5 text-primary" />
          <span>Rule-Based Transformations</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              {appliedRules.length > 0
                ? `${appliedRules.length} rule(s) applied`
                : 'No rules applied'}
            </AccordionTrigger>
            <AccordionContent>
              {appliedRules.length > 0 ? (
                <ul className="space-y-1 font-mono text-sm">
                  {appliedRules.map((rule, index) => (
                    <li key={index} className="rounded-md bg-muted p-2">
                      {rule}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  The rule-based engine did not find any matches for the current text and dialect.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
