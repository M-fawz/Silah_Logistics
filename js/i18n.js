/* =====================================================================
   i18n — pure-JS English/Arabic translation + layout direction.
   - Translations live in the TRANSLATIONS object below (single source).
   - Choice is persisted in localStorage under 'silah.lang'.
   - setLanguage() sets <html lang/dir>, re-applies all copy, and fires a
     'silah:langchange' event so dynamic widgets can re-render.
   Markup hooks:
     data-i18n="key"            -> textContent
     data-i18n-ph="key"         -> placeholder attribute
     data-i18n-aria="key"       -> aria-label attribute
     data-i18n-html="key"       -> innerHTML (used sparingly)
   ===================================================================== */
(function () {
  'use strict';

  var LANG_KEY = 'silah.lang';
  var SUPPORTED = ['en', 'ar'];
  var RTL = ['ar'];

  var TRANSLATIONS = {
    en: {
      common: {
        appName: 'Silah Logistics',
        tagline: 'Connect, Quote, Ship',
        login: 'Login',
        register: 'Register',
        getQuote: 'Get a Quote',
        getAQuote: 'Get a Quote',
        explorePlatform: 'Explore Platform',
        createAccount: 'Create Account',
        createFreeAccount: 'Create Free Account',
        startQuoteWizard: 'Start Quote Wizard',
        learnMore: 'Learn More',
        getStarted: 'Get Started',
        comingSoon: 'Coming soon',
        backHome: 'Back to Home',
        demoMode:
          'Demo mode — quotes shown are illustrative and no data is sent anywhere.'
      },
      nav: {
        switchToArabic: 'العربية',
        switchToEnglish: 'English',
        languageLabel: 'Language',
        openMenu: 'Open menu',
        closeMenu: 'Close menu'
      },
      sidebar: {
        quickQuote: 'Quick Quote',
        getQuote: 'Get Quote',
        viewRates: 'View Rates',
        carrierTracking: 'Carrier Tracking',
        services: 'Services',
        myQuotes: 'My Quotes',
        navigation: 'Navigation'
      },
      home: {
        hero: {
          title: 'Your Global Logistics Connection',
          subtitle:
            'Silah Logistics is a smart digital marketplace that connects you with a trusted network of freight forwarders — compare, book, and ship with confidence.',
          pills: {
            forwarders: '50+ Forwarders',
            countries: '100+ Countries',
            support: '24/7 Support'
          }
        },
        stats: {
          eyebrow: 'Trusted at scale',
          title: 'Numbers that move with you',
          activeShippers: 'Active Shippers',
          verifiedForwarders: 'Verified Forwarders',
          countriesServed: 'Countries Served',
          uptime: 'Uptime'
        },
        about: {
          eyebrow: 'About Silah',
          title: 'Built on 20+ years of industry expertise',
          body:
            'We combine decades of freight know-how with modern technology to make global shipping simple. From the first quote to final delivery, Silah keeps your cargo moving and your team informed.',
          points: {
            one: 'A vetted network of global freight forwarders',
            two: 'Transparent, comparable quotes in minutes',
            three: 'End-to-end visibility on every shipment'
          }
        },
        whyChoose: {
          eyebrow: 'Why Choose Silah',
          title: 'Everything you need to ship smarter',
          cards: {
            instantQuotes: {
              title: 'Instant Quotes',
              desc:
                'Submit one request and receive competitive quotes from multiple verified forwarders — no phone tag, no waiting.'
            },
            realTimeTracking: {
              title: 'Real-Time Tracking',
              desc:
                'Follow your cargo across sea, air, and land with live milestones and proactive status updates.'
            },
            support: {
              title: '24/7 Support',
              desc:
                'Our logistics specialists are on hand around the clock to keep your shipments on schedule.'
            }
          }
        },
        howItWorks: {
          eyebrow: 'How It Works',
          title: 'Ship in three simple steps',
          steps: {
            one: {
              title: 'Request an RFQ',
              desc:
                'Tell us your origin, destination, and cargo. It takes less than two minutes.'
            },
            two: {
              title: 'Compare Quotes',
              desc:
                'Review transparent offers from vetted forwarders side by side and pick the best fit.'
            },
            three: {
              title: 'Book & Ship',
              desc:
                'Confirm your booking and track every milestone through to delivery.'
            }
          }
        },
        network: {
          eyebrow: 'Global Network',
          title: 'One platform, worldwide reach',
          subtitle:
            'From major seaports to inland hubs, our partners connect 100+ countries across every major trade lane.',
          metrics: {
            ports: 'Connected Ports',
            lanes: 'Trade Lanes',
            partners: 'Logistics Partners'
          }
        },
        testimonial: {
          eyebrow: 'What our customers say',
          quote:
            'Silah turned a process that used to take days into minutes. We compare reliable forwarders in one place and our shipments have never been more predictable.',
          name: 'Omar A.',
          role: 'Head of Logistics'
        },
        finalCta: {
          title: 'Ready to streamline your shipments?',
          subtitle:
            'Start your free 3-month trial today — no credit card required.',
          trialBadge: 'Free 3-month trial',
          primary: 'Create Free Account',
          secondary: 'Get a Quote'
        }
      },
      howItWorks: {
        hero: {
          eyebrow: 'Platform Workflow',
          title: 'How Silah Logistics Works',
          subtitle:
            'From your first request to final delivery, Silah brings forwarders, customs, and warehousing onto a single transparent platform.'
        },
        services: {
          eyebrow: 'Core Services',
          title: 'Everything your cargo needs',
          items: {
            freight: {
              title: 'Freight Forwarding',
              desc:
                'Sea, air, and land freight through a vetted global network — booked and managed in one place.'
            },
            customs: {
              title: 'Customs Clearance',
              desc:
                'Expert documentation and compliance to clear your cargo quickly and avoid costly delays.'
            },
            warehousing: {
              title: 'Warehousing & Distribution',
              desc:
                'Flexible storage, fulfillment, and last-mile distribution that scale with your demand.'
            }
          }
        },
        process: {
          eyebrow: 'End-to-End Process',
          title: 'Four steps from request to delivery',
          steps: {
            account: {
              title: 'Create Account',
              desc: 'Set up your free account in minutes and add your company details.'
            },
            request: {
              title: 'Submit Request',
              desc: 'Enter your shipment details and cargo to create a request for quotes.'
            },
            quotes: {
              title: 'Receive Quotes',
              desc: 'Compare transparent offers from verified forwarders and choose the best.'
            },
            track: {
              title: 'Track Execution',
              desc: 'Book your shipment and follow every milestone in real time.'
            }
          }
        },
        whyChoose: {
          eyebrow: 'Why Choose Us',
          title: 'A platform built for trust',
          items: {
            pricing: {
              title: 'Transparent Pricing',
              desc: 'Clear, comparable quotes with no hidden fees.'
            },
            secure: {
              title: 'Secure Platform',
              desc: 'Your data and documents are protected end to end.'
            },
            fast: {
              title: 'Fast Quotes',
              desc: 'Receive competitive offers in minutes, not days.'
            },
            global: {
              title: 'Global Network',
              desc: 'Vetted forwarders connecting 100+ countries.'
            }
          }
        },
        cta: {
          title: 'Start shipping with Silah today',
          subtitle: 'Create your account or jump straight into a quick quote.',
          primary: 'Create Account',
          secondary: 'Start Quick Quote'
        }
      },
      quickStart: {
        eyebrow: 'Quick Quote',
        title: 'Get Your Shipping Quote',
        subtitle:
          'Answer a few quick questions and receive comparable quotes from our network of verified freight forwarders.',
        startWizard: 'Start Quote Wizard',
        createAccount: 'Create Account',
        benefitsTitle: 'What you get',
        benefits: {
          one: 'Compare multiple forwarders in one request',
          two: 'Transparent pricing with no hidden fees',
          three: 'Sea, air, and land freight options',
          four: 'A response in minutes, not days'
        },
        stats: {
          minutes: 'Avg. quote time (min)',
          forwarders: 'Verified forwarders',
          countries: 'Countries served'
        }
      },
      wizard: {
        title: 'Get Your Shipping Quote',
        subtitle: 'Complete the steps below to receive your quotes.',
        next: 'Next',
        back: 'Back',
        getQuotes: 'Get Quotes',
        startOver: 'Start Over',
        steps: {
          shipment: 'Shipment Details',
          cargo: 'Cargo Information',
          contact: 'Contact & Preferences'
        },
        shipment: {
          origin: 'Origin',
          originPlaceholder: 'Search origin port or city…',
          destination: 'Destination',
          destinationPlaceholder: 'Search destination port or city…',
          cargoType: 'Cargo Type',
          cargoTypeSelectLabel: 'Select cargo type',
          cargoTypes: {
            fcl: 'FCL',
            fclDesc: 'Full Container Load',
            lcl: 'LCL',
            lclDesc: 'Less than Container Load',
            air: 'Air Freight',
            airDesc: 'Fast air cargo',
            bulk: 'Bulk / Land',
            bulkDesc: 'Bulk & overland freight'
          }
        },
        cargo: {
          weight: 'Total Weight (kg)',
          weightPlaceholder: 'e.g. 1200',
          unitType: 'Unit Type',
          unitTypes: { boxes: 'Boxes', pallets: 'Pallets', containers: 'Containers' },
          containerType: 'Container Type',
          containerTypes: {
            '20std': '20ft Standard',
            '40std': '40ft Standard',
            '40hc': '40ft High Cube',
            reefer: 'Reefer',
            opentop: 'Open Top',
            flatrack: 'Flat Rack',
            isotank: 'ISO Tank'
          },
          special: 'Special Requirements',
          specialPlaceholder:
            'Dangerous goods, temperature control, oversized cargo, etc. (optional)'
        },
        contact: {
          email: 'Email',
          emailPlaceholder: 'you@company.com',
          phone: 'Phone',
          phonePlaceholder: '+1 555 000 0000',
          date: 'Preferred Shipment Date'
        },
        combobox: { noResults: 'No matching locations', clear: 'Clear selection' },
        validation: {
          originRequired: 'Please select an origin',
          destinationRequired: 'Please select a destination',
          sameLocation: 'Origin and destination must be different',
          cargoTypeRequired: 'Please choose a cargo type',
          weightRequired: 'Please enter the total weight',
          weightPositive: 'Weight must be greater than 0',
          unitRequired: 'Please choose a unit type',
          containerRequired: 'Please choose a container type',
          emailRequired: 'Please enter your email',
          emailInvalid: 'Please enter a valid email',
          phoneRequired: 'Please enter your phone number',
          dateRequired: 'Please choose a preferred date'
        },
        result: {
          title: 'Your quotes are ready',
          subtitle: 'Here are illustrative offers for {{origin}} → {{destination}}.',
          summaryTitle: 'Shipment summary',
          transit: 'Transit',
          days: 'days',
          estimated: 'Estimated',
          bestValue: 'Best value',
          fastest: 'Fastest',
          recommended: 'Recommended',
          selectQuote: 'Select Quote',
          newQuote: 'Start a New Quote',
          carrierA: 'Oceanic Express Lines',
          carrierB: 'Global Cargo Partners',
          carrierC: 'BlueLane Forwarding',
          note:
            'These figures are mocked for the demo and do not represent real pricing.'
        }
      },
      footer: {
        tagline:
          'A smart digital marketplace connecting shippers with a trusted network of freight forwarders.',
        product: 'Product',
        company: 'Company',
        legal: 'Legal',
        links: {
          services: 'Services',
          quickQuote: 'Quick Quote',
          tracking: 'Carrier Tracking',
          rates: 'View Rates',
          about: 'About',
          careers: 'Careers',
          contact: 'Contact',
          privacy: 'Privacy Policy',
          terms: 'Terms of Service',
          cookies: 'Cookie Policy'
        },
        rights: 'All rights reserved.',
        madeWith: 'Demo build — front-end only.'
      }
    },

    ar: {
      common: {
        appName: 'صلة للخدمات اللوجستية',
        tagline: 'تواصل، سعّر، اشحن',
        login: 'تسجيل الدخول',
        register: 'إنشاء حساب',
        getQuote: 'احصل على عرض سعر',
        getAQuote: 'احصل على عرض سعر',
        explorePlatform: 'استكشف المنصة',
        createAccount: 'إنشاء حساب',
        createFreeAccount: 'أنشئ حسابًا مجانيًا',
        startQuoteWizard: 'ابدأ معالج التسعير',
        learnMore: 'اعرف المزيد',
        getStarted: 'ابدأ الآن',
        comingSoon: 'قريبًا',
        backHome: 'العودة إلى الرئيسية',
        demoMode: 'وضع تجريبي — الأسعار المعروضة توضيحية ولا يتم إرسال أي بيانات.'
      },
      nav: {
        switchToArabic: 'العربية',
        switchToEnglish: 'English',
        languageLabel: 'اللغة',
        openMenu: 'فتح القائمة',
        closeMenu: 'إغلاق القائمة'
      },
      sidebar: {
        quickQuote: 'تسعير سريع',
        getQuote: 'احصل على عرض',
        viewRates: 'عرض الأسعار',
        carrierTracking: 'تتبّع الشحنة',
        services: 'الخدمات',
        myQuotes: 'عروضي',
        navigation: 'التنقّل'
      },
      home: {
        hero: {
          title: 'حلقة الوصل لخدماتك اللوجستية العالمية',
          subtitle:
            'صلة منصة رقمية ذكية تربطك بشبكة موثوقة من وكلاء الشحن — قارن، احجز، واشحن بثقة.',
          pills: {
            forwarders: 'أكثر من 50 وكيل شحن',
            countries: 'أكثر من 100 دولة',
            support: 'دعم على مدار الساعة'
          }
        },
        stats: {
          eyebrow: 'ثقة على نطاق واسع',
          title: 'أرقام تتحرك معك',
          activeShippers: 'شاحنون نشطون',
          verifiedForwarders: 'وكلاء شحن موثّقون',
          countriesServed: 'دول نخدمها',
          uptime: 'نسبة التشغيل'
        },
        about: {
          eyebrow: 'عن صلة',
          title: 'مبنية على خبرة تتجاوز 20 عامًا في القطاع',
          body:
            'نجمع بين عقود من الخبرة في الشحن والتقنيات الحديثة لنجعل الشحن العالمي بسيطًا. من أول عرض سعر حتى التسليم النهائي، تُبقي صلة شحنتك في حركة وفريقك على اطّلاع.',
          points: {
            one: 'شبكة موثّقة من وكلاء الشحن حول العالم',
            two: 'عروض أسعار شفافة وقابلة للمقارنة خلال دقائق',
            three: 'رؤية شاملة لكل شحنة من البداية للنهاية'
          }
        },
        whyChoose: {
          eyebrow: 'لماذا صلة',
          title: 'كل ما تحتاجه لتشحن بذكاء',
          cards: {
            instantQuotes: {
              title: 'عروض أسعار فورية',
              desc:
                'أرسل طلبًا واحدًا واحصل على عروض تنافسية من عدة وكلاء موثّقين — دون انتظار أو مكالمات متكررة.'
            },
            realTimeTracking: {
              title: 'تتبّع لحظي',
              desc:
                'تابع شحنتك برًا وبحرًا وجوًا عبر مراحل مباشرة وتحديثات استباقية للحالة.'
            },
            support: {
              title: 'دعم على مدار الساعة',
              desc:
                'خبراؤنا اللوجستيون متواجدون طوال الوقت للحفاظ على شحناتك في موعدها.'
            }
          }
        },
        howItWorks: {
          eyebrow: 'كيف تعمل',
          title: 'اشحن في ثلاث خطوات بسيطة',
          steps: {
            one: {
              title: 'أرسل طلب تسعير',
              desc: 'أخبرنا بنقطة الانطلاق والوجهة ونوع البضاعة. لا يستغرق الأمر دقيقتين.'
            },
            two: {
              title: 'قارن العروض',
              desc: 'راجع عروضًا شفافة من وكلاء موثّقين جنبًا إلى جنب واختر الأنسب.'
            },
            three: {
              title: 'احجز واشحن',
              desc: 'أكّد حجزك وتابع كل مرحلة حتى التسليم.'
            }
          }
        },
        network: {
          eyebrow: 'شبكة عالمية',
          title: 'منصة واحدة بامتداد عالمي',
          subtitle:
            'من كبرى الموانئ البحرية إلى المراكز الداخلية، يربط شركاؤنا أكثر من 100 دولة عبر كل مسارات التجارة الرئيسية.',
          metrics: {
            ports: 'موانئ متصلة',
            lanes: 'مسارات تجارية',
            partners: 'شركاء لوجستيون'
          }
        },
        testimonial: {
          eyebrow: 'ماذا يقول عملاؤنا',
          quote:
            'حوّلت صلة عملية كانت تستغرق أيامًا إلى دقائق. نقارن وكلاء موثوقين في مكان واحد وأصبحت شحناتنا أكثر انتظامًا من أي وقت مضى.',
          name: 'عمر أ.',
          role: 'مدير الخدمات اللوجستية'
        },
        finalCta: {
          title: 'هل أنت مستعد لتبسيط شحناتك؟',
          subtitle: 'ابدأ تجربتك المجانية لمدة 3 أشهر اليوم — دون الحاجة إلى بطاقة ائتمان.',
          trialBadge: 'تجربة مجانية لمدة 3 أشهر',
          primary: 'أنشئ حسابًا مجانيًا',
          secondary: 'احصل على عرض سعر'
        }
      },
      howItWorks: {
        hero: {
          eyebrow: 'آلية عمل المنصة',
          title: 'كيف تعمل صلة للخدمات اللوجستية',
          subtitle:
            'من أول طلب حتى التسليم النهائي، تجمع صلة وكلاء الشحن والتخليص الجمركي والتخزين في منصة واحدة شفافة.'
        },
        services: {
          eyebrow: 'الخدمات الأساسية',
          title: 'كل ما تحتاجه شحنتك',
          items: {
            freight: {
              title: 'وكالة الشحن',
              desc: 'شحن بحري وجوي وبري عبر شبكة عالمية موثّقة — يُحجز ويُدار من مكان واحد.'
            },
            customs: {
              title: 'التخليص الجمركي',
              desc: 'توثيق متخصص والتزام بالأنظمة لتخليص شحنتك بسرعة وتجنّب التأخير المكلف.'
            },
            warehousing: {
              title: 'التخزين والتوزيع',
              desc: 'تخزين وتجهيز وتوزيع للميل الأخير يتوسّع مع نموّ طلبك.'
            }
          }
        },
        process: {
          eyebrow: 'عملية متكاملة',
          title: 'أربع خطوات من الطلب إلى التسليم',
          steps: {
            account: {
              title: 'أنشئ حسابًا',
              desc: 'أنشئ حسابك المجاني خلال دقائق وأضف بيانات شركتك.'
            },
            request: {
              title: 'أرسل طلبًا',
              desc: 'أدخل تفاصيل شحنتك وبضاعتك لإنشاء طلب عروض أسعار.'
            },
            quotes: {
              title: 'استلم العروض',
              desc: 'قارن عروضًا شفافة من وكلاء موثّقين واختر الأفضل.'
            },
            track: {
              title: 'تابع التنفيذ',
              desc: 'احجز شحنتك وتابع كل مرحلة لحظة بلحظة.'
            }
          }
        },
        whyChoose: {
          eyebrow: 'لماذا تختارنا',
          title: 'منصة مبنية على الثقة',
          items: {
            pricing: {
              title: 'تسعير شفاف',
              desc: 'عروض واضحة وقابلة للمقارنة دون رسوم خفية.'
            },
            secure: {
              title: 'منصة آمنة',
              desc: 'بياناتك ومستنداتك محمية من البداية للنهاية.'
            },
            fast: {
              title: 'عروض سريعة',
              desc: 'احصل على عروض تنافسية خلال دقائق لا أيام.'
            },
            global: {
              title: 'شبكة عالمية',
              desc: 'وكلاء موثّقون يربطون أكثر من 100 دولة.'
            }
          }
        },
        cta: {
          title: 'ابدأ الشحن مع صلة اليوم',
          subtitle: 'أنشئ حسابك أو ابدأ مباشرة بتسعير سريع.',
          primary: 'إنشاء حساب',
          secondary: 'ابدأ التسعير السريع'
        }
      },
      quickStart: {
        eyebrow: 'تسعير سريع',
        title: 'احصل على عرض سعر شحنتك',
        subtitle:
          'أجب عن بضعة أسئلة سريعة واحصل على عروض قابلة للمقارنة من شبكتنا من وكلاء الشحن الموثّقين.',
        startWizard: 'ابدأ معالج التسعير',
        createAccount: 'إنشاء حساب',
        benefitsTitle: 'ما الذي تحصل عليه',
        benefits: {
          one: 'قارن عدة وكلاء بطلب واحد',
          two: 'تسعير شفاف دون رسوم خفية',
          three: 'خيارات شحن بحري وجوي وبري',
          four: 'ردّ خلال دقائق لا أيام'
        },
        stats: {
          minutes: 'متوسط زمن العرض (دقيقة)',
          forwarders: 'وكلاء موثّقون',
          countries: 'دول نخدمها'
        }
      },
      wizard: {
        title: 'احصل على عرض سعر شحنتك',
        subtitle: 'أكمل الخطوات التالية للحصول على عروضك.',
        next: 'التالي',
        back: 'السابق',
        getQuotes: 'احصل على العروض',
        startOver: 'ابدأ من جديد',
        steps: {
          shipment: 'تفاصيل الشحنة',
          cargo: 'معلومات البضاعة',
          contact: 'التواصل والتفضيلات'
        },
        shipment: {
          origin: 'نقطة الانطلاق',
          originPlaceholder: 'ابحث عن ميناء أو مدينة الانطلاق…',
          destination: 'الوجهة',
          destinationPlaceholder: 'ابحث عن ميناء أو مدينة الوجهة…',
          cargoType: 'نوع البضاعة',
          cargoTypeSelectLabel: 'اختر نوع البضاعة',
          cargoTypes: {
            fcl: 'حاوية كاملة',
            fclDesc: 'حمولة حاوية كاملة (FCL)',
            lcl: 'حاوية مشتركة',
            lclDesc: 'أقل من حمولة حاوية (LCL)',
            air: 'شحن جوي',
            airDesc: 'شحن جوي سريع',
            bulk: 'سائب / بري',
            bulkDesc: 'شحن سائب وبرّي'
          }
        },
        cargo: {
          weight: 'الوزن الإجمالي (كجم)',
          weightPlaceholder: 'مثال: 1200',
          unitType: 'نوع الوحدة',
          unitTypes: { boxes: 'صناديق', pallets: 'منصّات', containers: 'حاويات' },
          containerType: 'نوع الحاوية',
          containerTypes: {
            '20std': '20 قدمًا قياسية',
            '40std': '40 قدمًا قياسية',
            '40hc': '40 قدمًا عالية',
            reefer: 'مبرّدة',
            opentop: 'مفتوحة السقف',
            flatrack: 'منصّة مسطّحة',
            isotank: 'خزان ISO'
          },
          special: 'متطلبات خاصة',
          specialPlaceholder: 'بضائع خطرة، تحكّم بالحرارة، حمولة كبيرة الحجم… (اختياري)'
        },
        contact: {
          email: 'البريد الإلكتروني',
          emailPlaceholder: 'you@company.com',
          phone: 'رقم الهاتف',
          phonePlaceholder: '+966 5x xxx xxxx',
          date: 'تاريخ الشحن المفضّل'
        },
        combobox: { noResults: 'لا توجد مواقع مطابقة', clear: 'مسح الاختيار' },
        validation: {
          originRequired: 'يرجى اختيار نقطة الانطلاق',
          destinationRequired: 'يرجى اختيار الوجهة',
          sameLocation: 'يجب أن تختلف نقطة الانطلاق عن الوجهة',
          cargoTypeRequired: 'يرجى اختيار نوع البضاعة',
          weightRequired: 'يرجى إدخال الوزن الإجمالي',
          weightPositive: 'يجب أن يكون الوزن أكبر من 0',
          unitRequired: 'يرجى اختيار نوع الوحدة',
          containerRequired: 'يرجى اختيار نوع الحاوية',
          emailRequired: 'يرجى إدخال بريدك الإلكتروني',
          emailInvalid: 'يرجى إدخال بريد إلكتروني صحيح',
          phoneRequired: 'يرجى إدخال رقم هاتفك',
          dateRequired: 'يرجى اختيار التاريخ المفضّل'
        },
        result: {
          title: 'عروضك جاهزة',
          subtitle: 'إليك عروضًا توضيحية لمسار {{origin}} ← {{destination}}.',
          summaryTitle: 'ملخّص الشحنة',
          transit: 'مدة العبور',
          days: 'يومًا',
          estimated: 'تقديري',
          bestValue: 'أفضل قيمة',
          fastest: 'الأسرع',
          recommended: 'موصى به',
          selectQuote: 'اختر العرض',
          newQuote: 'ابدأ عرضًا جديدًا',
          carrierA: 'خطوط أوشيانك إكسبريس',
          carrierB: 'جلوبال كارجو بارتنرز',
          carrierC: 'بلو لين للشحن',
          note: 'هذه الأرقام تجريبية لأغراض العرض ولا تمثّل أسعارًا حقيقية.'
        }
      },
      footer: {
        tagline: 'منصة رقمية ذكية تربط الشاحنين بشبكة موثوقة من وكلاء الشحن.',
        product: 'المنتج',
        company: 'الشركة',
        legal: 'قانوني',
        links: {
          services: 'الخدمات',
          quickQuote: 'تسعير سريع',
          tracking: 'تتبّع الشحنة',
          rates: 'عرض الأسعار',
          about: 'من نحن',
          careers: 'الوظائف',
          contact: 'تواصل معنا',
          privacy: 'سياسة الخصوصية',
          terms: 'شروط الخدمة',
          cookies: 'سياسة ملفات الارتباط'
        },
        rights: 'جميع الحقوق محفوظة.',
        madeWith: 'نسخة تجريبية — واجهة أمامية فقط.'
      }
    }
  };

  var currentLang = 'en';

  function isRtl(lang) {
    return RTL.indexOf(lang) !== -1;
  }

  function resolve(dict, key) {
    var parts = key.split('.');
    var node = dict;
    for (var i = 0; i < parts.length; i++) {
      if (node == null) return undefined;
      node = node[parts[i]];
    }
    return node;
  }

  // Translate a dotted key with optional {{var}} interpolation.
  function t(key, vars) {
    var val = resolve(TRANSLATIONS[currentLang], key);
    if (val === undefined) val = resolve(TRANSLATIONS.en, key);
    if (val === undefined) return key;
    if (vars) {
      val = val.replace(/\{\{(\w+)\}\}/g, function (m, name) {
        return vars[name] != null ? vars[name] : '';
      });
    }
    return val;
  }

  function applyTo(root) {
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    root.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    root.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
    root.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    // Language toggle shows the *other* language.
    var nextKey = isRtl(currentLang) ? 'nav.switchToEnglish' : 'nav.switchToArabic';
    root.querySelectorAll('[data-lang-label]').forEach(function (el) {
      el.textContent = t(nextKey);
    });
    root.querySelectorAll('[data-lang-toggle]').forEach(function (el) {
      el.setAttribute('aria-label', t('nav.languageLabel') + ': ' + t(nextKey));
    });
  }

  function setHtmlDir() {
    var html = document.documentElement;
    html.setAttribute('lang', currentLang);
    html.setAttribute('dir', isRtl(currentLang) ? 'rtl' : 'ltr');
  }

  function storedLang() {
    var saved;
    try {
      saved = localStorage.getItem(LANG_KEY);
    } catch (e) {
      saved = null;
    }
    if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
    return 'en';
  }

  function setLanguage(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = 'en';
    currentLang = lang;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {
      /* storage unavailable — non-fatal */
    }
    setHtmlDir();
    applyTo(document);
    document.dispatchEvent(
      new CustomEvent('silah:langchange', { detail: { lang: lang } })
    );
  }

  function toggle() {
    setLanguage(isRtl(currentLang) ? 'en' : 'ar');
  }

  // Set <html lang/dir> as early as possible (called from <head>) to avoid a
  // flash of the wrong direction before the body renders.
  function preboot() {
    currentLang = storedLang();
    setHtmlDir();
  }

  function init() {
    currentLang = storedLang();
    setHtmlDir();
    applyTo(document);
  }

  window.I18n = {
    t: t,
    apply: applyTo,
    init: init,
    preboot: preboot,
    setLanguage: setLanguage,
    toggle: toggle,
    isRtl: function () {
      return isRtl(currentLang);
    },
    lang: function () {
      return currentLang;
    },
    locale: function () {
      return currentLang;
    }
  };
})();
