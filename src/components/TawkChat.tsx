'use client';

import Script from 'next/script';

export default function TawkChat() {
  // Only load Tawk chat in production
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <Script id="tawk-script" strategy="lazyOnload">
      {`
        var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
        (function(){
          var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
          s1.async=true;
          s1.src='https://embed.tawk.to/678985a8825083258e069157/1ihoj470m';
          s1.charset='UTF-8';
          s1.setAttribute('crossorigin','*');
          s0.parentNode.insertBefore(s1,s0);
        })();
      `}
    </Script>
  );
} 