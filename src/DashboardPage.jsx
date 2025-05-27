// src/DashboardPage.js
import React from "react";
// Adjust these paths if your 'ui' and 'chart' components are elsewhere
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
import NetworkVisualizer from "./components/chart/NetworkVisualizer";
import NetworkVisualizer4 from "./components/chart/NetworkVisualizer4";

const data = [
  // ... (your data array remains the same)
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
  {
    phrase: "Tour operator",
    synonyms: 0,
    frequency: 19,
    sentiment: -0.53,
    impact: -10.06,
  },
  {
    phrase: "Cancellation insurance",
    synonyms: 0,
    frequency: 8,
    sentiment: -0.92,
    impact: -7.33,
  },
  {
    phrase: "Price change",
    synonyms: 0,
    frequency: 8,
    sentiment: -0.9,
    impact: -7.24,
  },
  {
    phrase: "Speak german",
    synonyms: 0,
    frequency: 10,
    sentiment: -0.53,
    impact: -5.33,
  },
  {
    phrase: "15 minute",
    synonyms: 0,
    frequency: 7,
    sentiment: -0.71,
    impact: -5.0,
  },
  { phrase: "Flight time", synonyms: 0, frequency: 9, sentiment: 0, impact: 0 },
  {
    phrase: "Personal contact",
    synonyms: 0,
    frequency: 5,
    sentiment: 0.07,
    impact: 0.33,
  },
  {
    phrase: "Book holiday",
    synonyms: 0,
    frequency: 11,
    sentiment: 0.14,
    impact: 1.5,
  },
];

export function DashboardPage() {
  return (
    <div className="bg-white dark:bg-gray-800 p-0 md:p-0 rounded-lg shadow-md">
      <Tabs defaultValue="table" className="w-full">
        <TabsList className="mb-4 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <TabsTrigger
            value="table"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm"
          >
            TABLE VIEW
          </TabsTrigger>
          <TabsTrigger
            value="l_network"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm"
          >
            L Network
          </TabsTrigger>
          <TabsTrigger
            value="p_network"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm"
          >
            P Network
          </TabsTrigger>
        </TabsList>
        <TabsContent value="table">
          <Card className="border dark:border-gray-700">
            <CardContent className="overflow-x-auto p-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-b dark:border-gray-700">
                    <TableHead className="text-gray-600 dark:text-gray-300">
                      Phrase + [synonyms]
                    </TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300">
                      Frequency
                    </TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300">
                      Net sentiment
                    </TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300">
                      Total impact
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, i) => (
                    <TableRow
                      key={i}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                    >
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                        {item.phrase}{" "}
                        {item.synonyms ? `[${item.synonyms}]` : ""}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {item.frequency}
                      </TableCell>
                      <TableCell
                        className={`text-gray-700 dark:text-gray-300 ${
                          item.sentiment < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {item.sentiment.toFixed(2)}
                      </TableCell>
                      <TableCell
                        className={`text-gray-700 dark:text-gray-300 font-semibold ${
                          item.impact < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {item.impact.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="l_network">
          <Card className="border dark:border-gray-700">
            <CardContent className="p-4">
              <div className="relative w-full h-[600px]">
                <NetworkVisualizer data={data} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="p_network">
          <Card className="border dark:border-gray-700">
            <CardContent className="p-4">
              <div className="relative w-full h-[600px]">
                <NetworkVisualizer4 data={data} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Placeholder for chart components if they are not defined elsewhere
// const NetworkVisualizer = ({ data }) => <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">Bubble Chart Placeholder (needs data)</div>;
// const NetworkVisualizer4 = ({ data }) => <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">4-Zone Chart Placeholder (needs data)</div>;
