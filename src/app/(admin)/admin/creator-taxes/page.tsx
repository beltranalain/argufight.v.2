"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, FileText, DollarSign, Calendar } from "lucide-react";

export default function AdminCreatorTaxesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Receipt className="h-6 w-6 text-electric-blue" />
        <h1 className="text-2xl font-bold">Creator Taxes</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted/50 p-2">
                <FileText className="h-5 w-5 text-electric-blue" />
              </div>
              <CardTitle className="text-sm">W9 Forms</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Review submitted W9 forms from creators for tax compliance
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted/50 p-2">
                <DollarSign className="h-5 w-5 text-electric-blue" />
              </div>
              <CardTitle className="text-sm">1099 Generation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Generate and send 1099-NEC forms for creators earning over $600
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted/50 p-2">
                <Calendar className="h-5 w-5 text-electric-blue" />
              </div>
              <CardTitle className="text-sm">Tax Year Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Annual earnings summaries by creator for tax reporting
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
