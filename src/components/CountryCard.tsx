"use client";
import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import SheepSvg from "../../public/sheep.svg";

gsap.registerPlugin(useGSAP);

import type { CountrySeries } from "@/types/sheep";

import styles from "./CountryCard.module.css";

type CountryCardProps = {
  country: CountrySeries;
};

function slugToR(slug: string): number {
  let h = 5381;
  for (let i = 0; i < slug.length; i++) {
    h = ((h << 5) + h + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 101;
}

const SHEEP_PUNS = [
  "ewe ok?", "shear joy!", "fleece me!", "wool you?", "baa-rilliant!",
  "shear genius", "ewe-phoric!", "wool done!", "fleeced again", "ewe wish!",
  "shear luck", "wool power!", "baa-humbug", "ewe betcha!", "no probllama",
  "baaa-nanas!", "shear madness", "ewe again?", "baaa-dass!", "wool you stop",
  "ewe-nique!", "shear delight", "baa-sically", "wool-come!", "ewe-niversity",
  "shear terror", "baa-king mad", "wool-derful", "ewe-topia", "fleece navidad",
  "baa-bra streisand", "wool street", "ewe-turn", "shear will", "baa-roque",
  "wool-f pack", "ewe-logy", "fleecing it", "baa-tman!", "wool-ington",
  "ewe-phoria", "shear cliff", "baa-hamas", "wool-ly mammoth", "ewe-rope",
  "baa-gain hunt", "shear audacity", "ewe-logy", "wool over eyes", "baa-loney",
  "shear perfection", "ewe heard me", "baa-roque style", "wool-worthy", "ewe-nanimous",
  "baa-sketball", "shear bravery", "wool-timate", "ewe-niverse", "baa-listic!",
  "shear panic", "ewe-phemism", "baa-mboo", "wool-derness", "ewe-volution",
  "baa-nquet", "shear nonsense", "wool-ful thinking", "ewe-qual rights", "baa-ffle",
  "shear class", "ewe-surper", "baa-rmy", "wool-ver", "ewe-phemism",
  "baa-liwick", "shear nerve", "wool-ington boots", "ewe-ther way", "baa-nter",
  "shear coincidence", "ewe-nion", "baa-sis", "wool-en jumper", "ewe-nify",
  "baa-lavian", "shear cheek", "wool-ies", "ewe matter!", "baa-lm",
  "shear beauty", "ewe-dacity", "baa-nder", "wool-worth", "ewe-stalgic",
  "baa-lmy", "shear wit", "wool-en hat", "ewe-claimer", "baa-rnacle",
  "shear folly", "ewe-pbeat", "baa-njo", "wool-dly", "ewe-logy time",
  "baa-rista", "shear gall", "wool-timate goal", "ewe-nanimously", "baa-ttleground",
  "shear confusion", "ewe-levate", "baa-m baa-m", "wool-ster", "ewe-nforced",
  "baa-ker street", "shear luck of it", "wool-ligans", "ewe-ster egg", "baa-rnyard",
  "shear class act", "ewe-nion jack", "baa-ltic", "wool-dstock", "ewe-quality",
  "baa-ckyard", "shear surprise", "wool-dwide", "ewe-mbrella", "baa-njo pickin",
  "shear excellence", "ewe-fficient", "baa-stion", "wool-dcraft", "ewe-lympics",
  "baa-ggage", "shear bliss", "wool-dview", "ewe-nchanted", "baa-rking",
  "shear timing", "ewe-ffervescent", "baa-rometer", "wool-sey", "ewe-nited",
  "baa-zaar", "shear instinct", "wool-some", "ewe-nderful", "baa-rbed wire",
  "shear accident", "ewe-normous", "baa-ckstroke", "wool-dbreaker", "ewe-nviable",
  "baa-rock obama", "shear stubbornness", "wool-loping along", "ewe-xtra", "baa-ltimore",
  "shear confidence", "ewe-ngage!", "baa-dminton", "wool-lop", "ewe-ndeavour",
  "baa-rricade", "shear velocity", "wool-f whistle", "ewe-ndless", "baa-ttery",
  "shear audacity!", "ewe-ntastic", "baa-rbecue", "wool-worthies", "ewe-nvigorating",
  "baa-rren land", "shear determination", "wool-dly wise", "ewe-ntreprenuer", "baa-rrister",
  "shear amazement", "ewe-xtravagant", "baa-loney again", "wool-lowing", "ewe-xcellent",
  "baa-ng on!", "shear wonder", "wool-ies weather", "ewe-xquisite", "baa-rbarian",
];

export default function CountryCard({ country }: CountryCardProps) {
  const r = slugToR(country.slug);
  const pun = country.pun ?? SHEEP_PUNS[r % SHEEP_PUNS.length];
  const wrapRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      ".sheep_svg__face",
      { rotation: -4, transformOrigin: "50% 100%" },
      {
        rotation: 4,
        transformOrigin: "50% 100%",
        duration: 2.5 + r * 0.04,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: r * 0.13,
      }
    );

    const sel = gsap.utils.selector(wrapRef);
    const eyes = sel(".sheep_svg__left-eye circle, .sheep_svg__right-eye circle");

    if (eyes.length > 0) {
      gsap.set(eyes, { transformOrigin: "50% 50%", scaleY: 1 });

      const blinkTl = gsap.timeline({
        repeat: -1,
        repeatDelay: 3 + r * 0.09,
        delay: r * 0.22,
      });
      blinkTl
        .to(eyes, { scaleY: 0, duration: 0.06, ease: "power2.in" })
        .to(eyes, { scaleY: 1, duration: 0.1,  ease: "power2.out" })
        .to(eyes, { scaleY: 0, duration: 0.06, ease: "power2.in", delay: 0.12 })
        .to(eyes, { scaleY: 1, duration: 0.1,  ease: "power2.out" });
    }
  }, { scope: wrapRef, dependencies: [r] });

  return (
    <Link
      href={`/country/${country.slug}`}
      className={styles.card}
      data-flip={r > 50 ? "true" : undefined}
      style={{ "--r": r } as React.CSSProperties}
    >
      <div className={styles.sheepWrap} aria-hidden="true" ref={wrapRef}>
        <SheepSvg className={styles.sheepImg} aria-hidden="true" />
        <span className={styles.baaBubble}>{pun}</span>
      </div>

      <div className={styles.details}>
        <div className={styles.flagWrap}>
          <Image
            src={`https://flagcdn.com/256x192/${country.iso2code.toLowerCase()}.png`}
            alt=""
            width={80}
            height={54}
            className={styles.flag}
          />
        </div>
        <h2 className={styles.countryName}>{country.country}</h2>
      </div>
    </Link>
  );
}
