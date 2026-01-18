
'use client';
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { threatScenarios } from "./data";
import { ShieldQuestion } from "lucide-react";

export default function ThreatScenariosPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <ShieldQuestion className="h-6 w-6" />
            <span>Interactive Threat Scenarios</span>
          </CardTitle>
          <CardDescription>
            Test your decision-making skills in these realistic, story-driven security challenges. Each scenario presents a unique threat that requires critical thinking to resolve.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {threatScenarios.map((scenario) => (
          <Card key={scenario.slug} className="flex flex-col">
            <CardHeader>
              <CardTitle>{scenario.title}</CardTitle>
              <CardDescription>{scenario.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="flex gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">Category:</span>
                    <span className="text-xs font-bold">{scenario.category}</span>
                </div>
                 <div className="flex gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">Difficulty:</span>
                    <span className="text-xs font-bold capitalize">{scenario.difficulty}</span>
                </div>
            </CardContent>
            <CardContent>
               <Button asChild className="w-full">
                <Link href={`/threat-scenarios/${scenario.slug}`}>Launch Scenario</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
