'use client';

import { useState, useCallback, useEffect } from 'react';
import s from './PropertyCarousel.module.css';

export interface CarouselImage {
  id: string;
  url: string;
  fileName: string;
}

interface Props {
  images: CarouselImage[];
}

export default function PropertyCarousel({ images }: Props) {
  const [current, setCurrent] = useState(0);
  const count = images.length;

  const go = useCallback(
    (dir: -1 | 1) => setCurrent((c) => (c + dir + count) % count),
    [count],
  );

  // Arrow-key navigation
  useEffect(() => {
    if (count <= 1) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, count]);

  if (count === 0) return null;

  return (
    <div className={s.carousel}>
      <div className={s.viewport}>
        {/* Slides */}
        {images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={img.id}
            src={img.url}
            alt={img.fileName}
            className={[s.slide, i === current ? s.slideActive : ''].join(' ')}
            draggable={false}
          />
        ))}

        {/* Counter */}
        {count > 1 && (
          <span className={s.counter}>{current + 1} / {count}</span>
        )}

        {/* Arrows */}
        {count > 1 && (
          <>
            <button
              type="button"
              className={`${s.arrow} ${s.arrowLeft}`}
              onClick={() => go(-1)}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              className={`${s.arrow} ${s.arrowRight}`}
              onClick={() => go(1)}
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {count > 1 && (
        <div className={s.thumbs}>
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              className={[s.thumb, i === current ? s.thumbActive : ''].join(' ')}
              onClick={() => setCurrent(i)}
              aria-label={`Go to image ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.fileName} className={s.thumbImg} draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
