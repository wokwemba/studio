'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trainingCampaigns } from '@/app/training/data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ListChecks, Clock, Users, Target } from 'lucide-react';

export default function TrainingPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 font-headline">Training Campaigns</h1>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Available Campaigns</CardTitle>
          <CardDescription>
            Select a campaign to view its modules and start your training. Each campaign runs for 30–90 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {trainingCampaigns.map((campaign) => (
              <AccordionItem value={campaign.id} key={campaign.id}>
                <AccordionTrigger className="font-headline text-lg hover:no-underline">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-md">
                      <campaign.icon className="h-6 w-6 text-primary" />
                    </div>
                    {campaign.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pl-4 border-l-2 border-primary/20 ml-5">
                    <p className="text-muted-foreground">{campaign.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Duration: {campaign.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Audience: {campaign.audience}</span>
                      </div>
                       <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span>KPIs: {campaign.kpis}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 font-headline">Modules</h4>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {campaign.modules.map((module) => (
                           <Card key={module.id} className="bg-background hover:bg-accent/50 transition-colors">
                            <CardHeader>
                               <CardTitle className="text-base font-headline">{module.title}</CardTitle>
                             </CardHeader>
                            <CardContent>
                              <p className="text-xs text-muted-foreground mb-4 h-10">{module.description}</p>
                              <Button asChild variant="secondary" size="sm">
                                <Link href={`/training/${campaign.id}/${module.id}`}>
                                  Start Module
                                </Link>
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                     <div>
                      <h4 className="font-semibold mb-2 font-headline">Activities</h4>
                       <div className="flex flex-wrap gap-2">
                        {campaign.activities.map((activity, index) => (
                          <Badge key={index} variant="outline">{activity}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
