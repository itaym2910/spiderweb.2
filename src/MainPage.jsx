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
import NetworkVisualizer from "./components/chart/NetworkVisualizer";
import NetworkVisualizer4 from "./components/chart/NetworkVisualizer4";
import { Toggle } from "./components/ui/toggle";
import { Button } from "./components/ui/button";
import { ScrollArea } from "./components/ui/scroll-area";

function MainPage() {
  return (
    <div className="p-6 space-y-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">TABLE VIEW</TabsTrigger>
          <TabsTrigger value="bubble">L Network</TabsTrigger>
          <TabsTrigger value="chart4">P Network</TabsTrigger>
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
                <TableBody></TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bubble">
          <div className="relative w-full h-screen">
            <NetworkVisualizer />
          </div>
        </TabsContent>
        <TabsContent value="chart4">
          <div className="relative w-full h-screen">
            <NetworkVisualizer4 />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MainPage;
