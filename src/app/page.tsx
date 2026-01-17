
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cpu, Languages, Rocket, BookOpen, PenTool, Search, BotMessageSquare } from 'lucide-react';
import Image from 'next/image';
import { dialects } from '@/lib/languages';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay"
import React from 'react';
import Header from './components/header';
import Footer from './components/footer';

const featureCards = [
  {
    icon: <Cpu className="w-8 h-8 text-primary" />,
    title: 'AI-Powered Intelligence',
    description: 'Advanced JSON-based NLP model that learns and improves with every translation, ensuring accurate dialect conversions.',
  },
  {
    icon: <Languages className="w-8 h-8 text-primary" />,
    title: 'Regional Dialects',
    description: 'Supports major Marathi dialects including Pune, Mumbai, Nagpur, Konkan, and Standard Marathi with cultural context preservation.',
  },
  {
    icon: <Rocket className="w-8 h-8 text-primary" />,
    title: 'Real-time Processing',
    description: 'Lightning-fast translations with confidence scoring and automatic dialect detection for a seamless user experience.',
  },
];

const staticDialectData: {[key: string]: {icon: React.ReactNode, subtitle: string, description: string, example: string, color: string}} = {
    standard: {
        icon: <BookOpen className="w-6 h-6 text-orange-600" />,
        subtitle: 'प्रमाण मराठी',
        description: 'Formal, literary form of Marathi used in official documents and literature.',
        example: 'तुम्ही कसे आहात?',
        color: 'bg-orange-50 border-orange-200',
    },
    pune: {
        icon: <PenTool className="w-6 h-6 text-blue-600" />,
        subtitle: 'पुणेरी मराठी',
        description: 'Informal, friendly dialect from Pune and Western Maharashtra region.',
        example: 'तुम्ही कसे आहात रे?',
        color: 'bg-blue-50 border-blue-200',
    },
    mumbai: {
        icon: <BotMessageSquare className="w-6 h-6 text-green-600" />,
        subtitle: 'मुंबई मराठी',
        description: 'Cosmopolitan dialect with Hindi influence from the Mumbai region.',
        example: 'तू कसा आहेस यार?',
        color: 'bg-green-50 border-green-200',
    },
    nagpur: {
        icon: <BotMessageSquare className="w-6 h-6 text-purple-600" />,
        subtitle: 'नागपुरी मराठी',
        description: 'Warm, friendly dialect from the Vidarbha region with unique expressions.',
        example: 'तुम्ही कसे काय?',
        color: 'bg-purple-50 border-purple-200',
    },
    kolhapur: {
        icon: <BotMessageSquare className="w-6 h-6 text-red-600" />,
        subtitle: 'कोल्हापुरी मराठी',
        description: 'Direct and bold dialect from the Kolhapur district.',
        example: 'काय बोल्लीस?',
        color: 'bg-red-50 border-red-200',
    },
    malvani: {
        icon: <BotMessageSquare className="w-6 h-6 text-teal-600" />,
        subtitle: 'मालवणी मराठी',
        description: 'Coastal dialect with unique pronunciations from the Konkan region.',
        example: ' कसो आसा?',
        color: 'bg-teal-50 border-teal-200',
    },
    default: {
        icon: <Search className="w-6 h-6 text-yellow-600" />,
        subtitle: 'प्रादेशिक विविधता',
        description: 'A unique dialect with its own linguistic characteristics.',
        example: '...',
        color: 'bg-yellow-50 border-yellow-200',
    }
};

const dialectCards = dialects.map(dialect => {
    const data = staticDialectData[dialect.value] || staticDialectData.default;
    return {
        icon: data.icon,
        title: dialect.label,
        subtitle: data.subtitle,
        description: data.description,
        example: data.example,
        color: data.color
    }
});


const impactStats = [
    { value: `${dialects.length - 1}+`, label: 'Supported Dialects' },
    { value: '96%', label: 'Translation Accuracy' },
    { value: '1000+', label: 'Active Users' },
]

export default function Home() {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  )

  return (
    <>
    <Header />
    <main className="flex-grow">
    <div className="w-full flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full text-center py-20 lg:py-32">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground">MaatiBhasha AI</h1>
        <p className="text-2xl md:text-3xl font-medium text-primary mt-4">मराठी भाषा बुद्धिमत्ता प्रणाली</p>
        <p className="max-w-3xl mx-auto mt-6 text-lg text-muted-foreground">
          Advanced AI-powered Marathi dialect translation system that preserves the cultural richness of Maharashtra's diverse linguistic heritage.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-lg py-6 px-8">
            <Link href="/translator">Start Translating</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="text-lg py-6 px-8 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/register">Create an Account</Link>
          </Button>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="w-full max-w-7xl mx-auto py-20 px-4">
        <Card className="bg-card/50 border-2 border-border rounded-2xl shadow-xl">
          <CardHeader className="pt-12">
            <h2 className="text-4xl font-bold text-center">Why Choose MaatiBhasha AI?</h2>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-8 py-12">
            {featureCards.map((card) => (
              <div key={card.title} className="flex flex-col items-center text-center p-4">
                <div className="bg-primary/10 p-4 rounded-full mb-4">{card.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                <p className="text-muted-foreground">{card.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Supported Dialects Section */}
      <section className="w-full max-w-7xl mx-auto py-20 px-4">
        <h2 className="text-4xl font-bold text-center">Supported Marathi Dialects</h2>
        <p className="text-lg text-muted-foreground text-center mt-2 mb-12">Experience the linguistic diversity of Maharashtra</p>
        <Carousel 
          plugins={[plugin.current]}
          className="w-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-4">
            {dialectCards.map((dialect) => (
              <CarouselItem key={dialect.title} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className={`shadow-lg rounded-xl border-2 hover:shadow-2xl transition-shadow h-full ${dialect.color}`}>
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-start gap-4">
                        {dialect.icon}
                        <div>
                          <h3 className="text-lg font-bold">{dialect.title}</h3>
                          <p className="text-sm font-medium text-gray-500">{dialect.subtitle}</p>
                        </div>
                      </div>
                      <p className="mt-4 text-gray-600 flex-grow">{dialect.description}</p>
                      <div className="mt-4 bg-white/70 p-3 rounded-lg border border-dashed border-gray-300">
                        <p className="text-sm text-gray-700 font-mono">Example: "{dialect.example}"</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

        {/* Our Impact Section */}
      <section className="w-full bg-primary text-primary-foreground py-20">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold mb-12">Our Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {impactStats.map(stat => (
                    <div key={stat.label}>
                        <p className="text-6xl font-extrabold">{stat.value}</p>
                        <p className="text-xl opacity-80 mt-2">{stat.label}</p>
                    </div>
                ))}
            </div>
          </div>
      </section>

       {/* Ready to Experience Section */}
      <section className="w-full text-center py-20 lg:py-28">
        <h2 className="text-4xl font-bold">Ready to Experience Marathi AI?</h2>
        <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
          Join thousands of users preserving and celebrating Marathi linguistic heritage.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-lg py-6 px-8">
            <Link href="/translator">Try Free Translation</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-lg py-6 px-8">
            <Link href="/register">Create Account</Link>
          </Button>
        </div>
      </section>

    </div>
    </main>
    <Footer/>
    </>
  );
}
