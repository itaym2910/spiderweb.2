import React from "react";
import { Card, CardContent } from "./components/ui/card";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "./components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import { Toggle } from "./components/ui/toggle";
import { Button } from "./components/ui/button";
import { ScrollArea } from "./components/ui/scroll-area";

const data = [
  {
    phrase: "Travel insurance",
    synonyms: 4,
    frequency: 34,
    sentiment: -0.92,
    impact: -31.3,
  },
  {
    phrase: "Coupon code",
    synonyms: 2,
    frequency: 33,
    sentiment: -0.86,
    impact: -28.45,
  },
  {
    phrase: "Wait time",
    synonyms: 7,
    frequency: 35,
    sentiment: -0.75,
    impact: -26.34,
  },
  {
    phrase: "Credit card",
    synonyms: 2,
    frequency: 18,
    sentiment: -0.84,
    impact: -15.18,
  },
  {
    phrase: "Booking confirmation",
    synonyms: 3,
    frequency: 16,
    sentiment: -0.77,
    impact: -12.33,
  },
  {
    phrase: "Travel document",
    synonyms: 1,
    frequency: 11,
    sentiment: -1.0,
    impact: -11.0,
  },
  { phrase: "Tour operator", frequency: 19, sentiment: -0.53, impact: -10.06 },
  {
    phrase: "Cancellation insurance",
    frequency: 8,
    sentiment: -0.92,
    impact: -7.33,
  },
  { phrase: "Price change", frequency: 8, sentiment: -0.9, impact: -7.24 },
  { phrase: "Speak german", frequency: 10, sentiment: -0.53, impact: -5.33 },
  { phrase: "15 minute", frequency: 7, sentiment: -0.71, impact: -5.0 },
  { phrase: "Flight time", frequency: 9, sentiment: 0, impact: 0 },
  { phrase: "Personal contact", frequency: 5, sentiment: 0.07, impact: 0.33 },
  { phrase: "Book holiday", frequency: 11, sentiment: 0.14, impact: 1.5 },
];

function MainPage() {
  return (
    <div className="p-6 space-y-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">TABLE VIEW</TabsTrigger>
          <TabsTrigger value="bubble">BUBBLE CHART</TabsTrigger>
        </TabsList>
        <TabsContent value="table">
          <Card>
            <CardContent className="overflow-x-auto p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phrase + [synonyms]</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Net sentiment</TableHead>
                    <TableHead>Total impact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        {item.phrase}{" "}
                        {item.synonyms ? `[${item.synonyms}]` : ""}
                      </TableCell>
                      <TableCell>{item.frequency}</TableCell>
                      <TableCell>{item.sentiment}</TableCell>
                      <TableCell>{item.impact}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bubble">
          <div className="h-64 flex items-center justify-center text-gray-400">
            Bubble chart view (to be implemented)
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MainPage;
