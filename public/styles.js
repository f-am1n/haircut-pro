// Формат: "Название RU|search term EN". Для каждого типа лица: короткие / средние / длинные.
const S = (s) => s.split(";").map((x) => x.split("|"));

export const STYLES = {
  male: {
    oval: {
      short: S("Кроп с текстурой|french crop;Андеркат|undercut;Баззкат|buzz cut"),
      medium: S("Квифф|quiff;Помпадур|pompadour;Боковой пробор|side part"),
      long: S("Зачёс назад|slicked back long hair;Волны до плеч|long wavy hair;Мужской пучок|man bun"),
    },
    round: {
      short: S("Высокий фейд|high fade textured top;Фо-хок|faux hawk;Короткий квифф|short quiff"),
      medium: S("Помпадур с фейдом|pompadour fade;Боковой пробор с объёмом|side part volume;Текстурный верх|textured top"),
      long: S("Прямые до плеч|straight shoulder length hair;Зачёс назад|long slicked back;Слои с пробором|layered long hair"),
    },
    square: {
      short: S("Кроп с чёлкой|textured crop fringe;Баззкат|buzz cut;Айви-лиг|ivy league"),
      medium: S("Классический пробор|classic side part;Мягкий квифф|soft quiff;Текстурный зачёс|textured swept"),
      long: S("Волны до плеч|long wavy hair;Зачёс назад|long slicked back;Пучок|man bun"),
    },
    heart: {
      short: S("Кроп с чёлкой вперёд|textured fringe crop;Боковой фейд|side swept fade;Короткий пробор|short side part"),
      medium: S("Волнистая чёлка|medium wavy fringe;Боковой пробор|medium side part;Текстурный зачёс|medium textured"),
      long: S("Слои до плеч|long layered hair;Волны|long wavy hair;Свободный зачёс|long swept back"),
    },
    oblong: {
      short: S("Кроп с чёлкой|full fringe crop;Короткие бока с объёмом|short sides volume;Бокс с чёлкой|short fringe cut"),
      medium: S("Чёлка с боками|medium fringe;Каскад|medium layered;Кудри|medium curly"),
      long: S("Объёмные волны|voluminous long waves;Кудри до плеч|long curly hair;Слои с чёлкой|long layers fringe"),
    },
    diamond: {
      short: S("Чёлка и фейд|fringe fade;Текстурный кроп|textured crop;Короткий боковой пробор|short side part"),
      medium: S("Квифф|medium quiff;Зачёс назад|medium slicked back;Чёлка набок|side swept fringe"),
      long: S("Слои до плеч|long layered;Волны|long wavy;Зачёс назад|long back"),
    },
  },
  female: {
    oval: {
      short: S("Пикси|pixie cut;Короткий боб|short bob;Французский боб|french bob"),
      medium: S("Лоб|lob;Волны до плеч|shoulder waves;Шторки|curtain bangs"),
      long: S("Длинные слои|long layers;Прямые длинные|long straight;Голливудские волны|hollywood waves"),
    },
    round: {
      short: S("Асимметричный пикси|asymmetric pixie;Удлинённый боб|angled bob;Пикси с объёмом|volume pixie"),
      medium: S("Длинный боб|long bob side part;Слои с пробором|layered medium side part;Лёгкие волны|loose waves"),
      long: S("Длинные слои|long layers;Прямые с боковой чёлкой|long straight side bangs;Волны с пробором|deep part waves"),
    },
    square: {
      short: S("Пикси с чёлкой|pixie long fringe;Боб-каре со слоями|layered bob;Шэгги-боб|shaggy bob"),
      medium: S("Мягкие волны|soft waves;Боб с боковой чёлкой|bob side bangs;Шэг|shag"),
      long: S("Слои с локонами у лица|long layers face framing;Волны|long waves;Кудри|long curls"),
    },
    heart: {
      short: S("Боб до подбородка|chin length bob;Пикси с чёлкой|pixie side bangs;Французский боб|french bob"),
      medium: S("Шторки|curtain bangs medium;Лоб|lob;Волны ниже подбородка|waves below chin"),
      long: S("Слои с боковой чёлкой|long layers side bangs;Волны ниже плеч|long waves;Шторки|long curtain bangs"),
    },
    oblong: {
      short: S("Боб с чёлкой|bob with bangs;Французский боб|french bob bangs;Пикси с чёлкой|pixie bangs"),
      medium: S("Объёмные волны|voluminous waves;Шэг с чёлкой|shag bangs;Каре с чёлкой|bob blunt bangs"),
      long: S("Слои с прямой чёлкой|long layers blunt bangs;Кудри|long curls;Объёмные волны|big volume waves"),
    },
    diamond: {
      short: S("Боб с чёлкой|bob side bangs;Пикси удлинённый|long pixie;Короткий шэг|short shag"),
      medium: S("Объём у подбородка|jawline volume waves;Лоб с чёлкой|lob bangs;Шторки|curtain bangs"),
      long: S("Слои со шторками|long layers curtain bangs;Мягкие волны|soft long waves;Прямые|long straight"),
    },
  },
};

export const LENGTHS = [["short", "Короткие"], ["medium", "Средние"], ["long", "Длинные"]];

export const SHAPE_INFO = {
  oval: ["Овальное", "Пропорциональное лицо: длина примерно в 1.3–1.5 раза больше ширины, лоб чуть шире подбородка. Подходит большинство причёсок."],
  round: ["Круглое", "Длина и ширина близки, скулы мягкие, подбородок округлый. Цель — добавить вертикали и углов."],
  square: ["Квадратное", "Широкая выраженная челюсть и лоб схожей ширины. Цель — смягчить углы или подчеркнуть мужественность."],
  heart: ["Сердцевидное", "Широкий лоб и узкий подбородок. Цель — сбалансировать верх и низ объёмом у подбородка."],
  oblong: ["Вытянутое", "Лицо заметно длиннее, чем шире. Цель — визуально укоротить, добавить объём по бокам."],
  diamond: ["Ромбовидное", "Самые широкие — скулы, лоб и подбородок уже. Цель — добавить ширины на лбу и у подбородка."],
};
