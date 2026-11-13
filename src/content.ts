/* ═══════════════════════════════════════════════════════════════════════
   ✧  A LITTLE UNIVERSE FOR YOU — EDIT EVERYTHING PERSONAL HERE  ✧
   ───────────────────────────────────────────────────────────────────────
   This is the ONLY file you need to touch to personalise the site.

   • Photos: put image files in  /public/photos/  and reference them with
     photo('your-file.jpg').  Photos are shown exactly as they are: they are
     only cropped by frames, never altered.
   • Anything inside [SQUARE BRACKETS] is a placeholder waiting for you.
   • Songs: add 5–8 entries. `cover` and `link` are optional.
   ═══════════════════════════════════════════════════════════════════════ */

const base = import.meta.env.BASE_URL;
/** Resolve a file inside /public/photos so it works on GitHub Pages too. */
export const photo = (file: string) => `${base}photos/${file}`;

export type Photo = {
  src: string; // full-size image (used in the enlarged view)
  thumb?: string; // smaller copy used inside frames (falls back to src)
  alt: string;
  caption?: string; // little handwritten caption under the polaroid
};

export type Song = {
  title: string;
  artist: string;
  /** Album cover image. Leave undefined to get a hand-painted placeholder cover. */
  cover?: string;
  /** Why this song reminds you of them (handwritten note). */
  memory: string;
  /** Optional short lyric excerpt, written by you (keep it short). */
  lyrics?: string;
  /** Optional Spotify / YouTube / Apple Music link. Leave '' to hide the button. */
  link?: string;
  /** Tint for the placeholder cover. */
  tint?: 'blush' | 'powder' | 'gold' | 'olive' | 'indigo' | 'lilac';
};

const p = (name: string, alt: string, caption?: string): Photo => ({
  src: photo(`${name}.jpg`),
  thumb: photo(`${name}-sm.jpg`),
  alt,
  caption,
});

export const content = {
  /* ── who this is for ─────────────────────────────────────────── */
  birthdayPersonName: '[BIRTHDAY PERSON NAME]',
  birthdayNickname: 'my alpha dbcu',
  senderName: 'nasabi - hanoi',
  birthdayDate: '14.11.2026',

  /* ── scene 1: intro ──────────────────────────────────────────── */
  intro: {
    line1: 'To my favorite alpha...',
    line2: 'Welcome to dbcu-verse',
    /** shown as:  note ♡ noteSignoff */
    note: 'Made with my pheromone',
    noteSignoff: '- from nasabi',
    button: 'Open your little universe',
    returningButton: 'Return to your little universe',
  },

  /* ── scene 2: cake ───────────────────────────────────────────── */
  cake: {
    heading: 'Make a Wish',
    /** small number before the heading, e.g. '02.' — leave '' for none */
    number: '',
    message: 'Every birthday deserves a little magic. Make this cake yours.',
    wishLine: 'Close your eyes. Make a wish.',
    blowLine: 'Tap the flames to blow them out',
    afterWishLine: 'your wishes is on its way to the stars',
  },

  /* ── scene 3: the personal planet ────────────────────────────── */
  birthdayMessage: 'for the wittiest, xàm-est, favorite alpha in my dbcu-verse',
  heroPhoto: p('photobooth-1', 'The two of us in a black-and-white photobooth, making peace signs', 'freaks'),

  /** The floating “memory star” on the left side of the universe. */
  memoryStar: {
    label: 've vietnam soon, i miss you',
    photo: p('film-pizza', 'The two of us at a restaurant, pulling faces at the camera', 'wetpuppy'),
    message: 'i am still waiting for our next fat session',
  },

  /** Photos of the two of you. The first two appear inside the letter;
      the rest make up the small gallery at the bottom of the letter
      and the hanging polaroids in the universe. */
  sharedPhotos: [
    p('photobooth-4', 'The two of us hugging in a photobooth'),
    p('horse-statue', 'Sitting on a bronze horse statue under a big umbrella'),
    p('film-silly', 'Being silly on a film camera'),
    p('photobooth-3', 'Photobooth pose, one leg up'),
    p('dance-poses', 'Striking dramatic poses in front of a mural'),
    p('street', 'A quiet moment on the street'),
    p('photobooth-5', 'Photobooth, tongues out'),
    p('graduation', 'Graduation caps from behind'),
    p('photobooth-2', 'Photobooth, cheek-squish pose'),
  ] as Photo[],

  /* ── scene 4: the music planet ───────────────────────────────── */
  playlistTitle: 'Songs That Remind Me of You',
  playlistNumber: '',
  playlistSubtitle: 'a little mixtape of you — tap a song to open',
  songs: [
    {
      title: 'its not like i like you',
      artist: 'feat. eminrichu, static-p,...',
      memory: '=))) lúc nào đi karaoke m với mfat cũng hát bài này i can’t get it out of my head',
      lyrics: 'could we hold hands, kiss?',
      link: 'https://open.spotify.com/track/4WwziJRU6hAdI4j8C0j0QI',
      tint: 'blush',
    },
    {
      title: 'nasty',
      artist: 'tinashe',
      memory: 't cảm giác m cứ giống bài này (imo) in a good way, chúc bạn sẽ gặp được người match your nasty freak :p',
      lyrics: 'is somebody gonna match my freak?',
      link: 'https://open.spotify.com/track/1iIkP4FMKqOw5nqbrKUqEC',
      tint: 'lilac',
    },
    {
      title: 'phases of the moon',
      artist: 'my anh',
      memory: 'ảnh bday m đẹp vl, my shayla, vca bài này mang cho t cảm giác strong nhma hơi bí ẩn và đằng sau đấy soft soft nên thấy giống dbcu, hope everything thuận lợi cho dbcu in all phases of the moon!',
      lyrics: 'i don’t mind going insane holding on',
      link: 'https://open.spotify.com/track/7kmuy7PgxxXxavSCn1rGwj',
      tint: 'powder',
    },
    {
      title: 'after the storm',
      artist: 'kali uchis',
      memory: '0:52 - 1:40',
      lyrics: 'winners don’t quit',
      link: 'https://open.spotify.com/track/1otG6j1WHNvl9WgXLWkHTo',
      tint: 'gold',
    },
  ] as Song[],

  /** Little handwritten notes scattered between the song cards. */
  songMemories: [] as string[],

  /* ── scene 5: the hidden letter ──────────────────────────────── */
  letterClue: 'Psst... there’s something here.',
  letterText: {
    greeting: 'happy 19th birthday purang!',
    /** Each string is one paragraph. Replace every one of them. */
    paragraphs: [
      'năm đầu xa nhau anh có thấy nhớ em không? em cũng hơi nhớ sự witty, trường giang, freak của anh một chút. tmi cái hộp năm ngoái m làm cho t í, t thích vl t còn mang sang tận nhà ở ocean park để để cho nó có "hơi người" =)))) xong mấy lúc t về mệt vãi t nhìn thấy cái đấy xong t được remind là vẫn có những người quý t như thế, chỉ là người ta không ở đây thôi nên t cũng muốn m nhận được cái gì đó cảm thấy được như t cảm thấy hihi',
      'hy vọng dbcu thích dbcu-verse này và nhớ tới t mỗi khi stumble upon it, chúc cho dbcu tuổi mới luôn rực rỡ 8386 cái gì cũng thuận lợi nhá, muốn tâm sự support cái gì thì hãy nhớ tới lê như anh, mình cách nhau có 10 tiếng bay thôi t vẫn support from afar được. genuienly happy vì qua úc xong thấy m vui hơn, more friends, finds people who match your freak 😃 nhưng mà k được quên những người ở nhà (đặc biệt là t) đâu nhé!',
      'have the happiest 19th, always rooting for you!',
    ],
    /** the two letter photos appear after this paragraph (1 = after the first) */
    photosAfterParagraph: 1,
    closing: 'love you, xoxo',
  },
  closingLine: 'Some people make the universe feel a little brighter. You’re one of them.',
  finalStarNote: 'One more year of you. How lucky is the world?',

  /* ── sound ───────────────────────────────────────────────────────
     The sound toggle plays this file (looping). Put the audio file at
     public/audio/superpower.mp3. If the file isn't there, the toggle
     falls back to a soft generated night-sky hum.
     With `autoplay: true` the song starts as soon as the browser allows it
     (most browsers wait for the first tap or key press on the page). */
  optionalAudio: {
    src: `${base}audio/superpower.mp3`,
    title: 'superpower',
    artist: 'daniel caesar',
    volume: 0.6,
    autoplay: true,
  },

  /* ── cake decorating settings ────────────────────────────────── */
  decorationSettings: {
    maxDecorations: 80,
    /** If no candles were placed, this many are added before the wish. */
    autoCandles: 3,
  },
};

export type Content = typeof content;
