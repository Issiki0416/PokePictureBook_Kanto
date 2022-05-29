interface PokeAPI {
  id: number;
  name: string;
  names: {
    langage:{
      name: string;
      url: string;
    };
    name:string;
  }[];
  pokespecies:{
    name: string;
    url: string;
  }[];
  varieties:{
    "is_default": boolean;
    "pokemon": {
    name: string;
    url: string;
  };
  }[];
  
}
type PokeType = {
  types: {
    type:{
      name: string;
      url: string;
    };
  }[];
};


//music処理
const sounds:string[] = ["music1", "music2", "music3", "music4", "music5", "music6"];

//soundsの数だけHTMLButtonElementを作成

sounds.forEach((sound) => {
  const btn = <HTMLButtonElement>document.createElement("button");
  btn.classList.add("btn");

  btn.innerText = sound;
  btn.addEventListener("click", () => {
    stopSongs();
    const song = <HTMLAudioElement>document.getElementById(sound);
    song.play();
  });
  const buttons = <HTMLButtonElement>document.getElementById("buttons");
  buttons.appendChild(btn);
});


/**
 * 音楽をとめる関数
 * @param 
 * @returns
 */
function stopSongs() {
  sounds.forEach((sound) => {
    // audioObject.currentTimeは、埋め込みオーディオ（audio要素）の再生位置を取得、もしくは、設定するプロパティ。
    const song = <HTMLAudioElement>document.getElementById(sound);
    song.pause();
    song.currentTime = 0;
  });
}

const stop_sound = <HTMLButtonElement>document.getElementById("stop_btn");
stop_sound.addEventListener("click", () => {
  stopSongs();
});

const poke_container = <HTMLDivElement>document.getElementById("poke-container");
const pokemon_count = 151;

//カード用colorオブジェクト
const colors = {
  fire: "#dc5949",
  grass: "#95c779",
  electric: "#f2d479",
  water: "#73b8ea",
  ground: "#e3cb8e",
  rock: "#c2a75f",
  fairy: "#6c6ca1",
  poison: "#9b5fa7",
  bug: "#bdb85f",
  dragon: "#6687e3",
  psychic: "#e36c9b",
  flying: "#b2bdea",
  fighting: "#873530",
  normal: "#b8b895",
};
//日本語タイプ変換用ja_typesオブジェクト
const ja_types = {
  fire: "ほのお",
  grass: "くさ",
  electric: "でんき",
  water: "みず",
  ground: "じめん",
  rock: "#いわ",
  fairy: "ゴースト",
  poison: "どく",
  bug: "むし",
  dragon: "ドラゴン",
  psychic: "エスパー",
  flying: "ひこう",
  fighting: "かくとう",
  normal: "ノーマル",
};

//オブジェクトのキーを取得
const main_types = Object.keys(colors);
const main_ja_types = Object.keys(ja_types);

//ポケモン151匹分のループ　getPokemon()を内部から呼び出す
const fetchPokemons = async () => {
  for (let i = 1; i <= pokemon_count; i++) {
    await getPokemon(i);
  }
};

//APIをたたくためのフェッチ
let pokemonUrl;
const getPokemon = async (id:number) => {
  //APIでjsonを取得
  const url = `https://pokeapi.co/api/v2/pokemon-species/${id}`;
  // Response のストリームを取得して完全に読み取ります。本文のテキストを JSON として解釈した結果で解決するプロミスを返します。
  const res = await fetch(url);
  const data:PokeAPI = await res.json();

  //ポケモン名、urlを取得
  let pokeName = data["names"][0]["name"];
  pokemonUrl = data["varieties"][0]["pokemon"]["url"];
  const res2 = await fetch(pokemonUrl);
  const data2 = await res2.json();
  
  let pokeType:PokeType = data2["types"];
  createPokemonCard(data, pokeType, pokeName, id);
};

/**
 * ポケモンのカードを作成する関。HTMLを追加する
 * @param pokemon ポケモンのデータ
 * @param pokeType ポケモンのタイプ
 * @param pokeName ポケモンの名前
 * @param number ポケモンのID
 */

const createPokemonCard = (pokemon:PokeAPI, pokeType:PokeType, pokeName:string, number:number) => {
  const pokemonEl = <HTMLDivElement>document.createElement("div");
  pokemonEl.classList.add("pokemon");
  pokemonEl.classList.add("box");
  //pokeEl.idにポケモンのIDを設定
  pokemonEl.id = `${number}`;
  //idは3文字表示
  const id = pokemon.id.toString().padStart(3, "0");

  //ポケモンのタイプでスタイルを変える
//typeからmapでポケモンのtypeを取得

  //@ts-ignore
  const pokemon_types = pokeType.map((type:any) => type.type.name);
  const type = main_types.find((type) => pokemon_types.indexOf(type) > -1);
  //@ts-ignore
  const color = colors[type];
  pokemonEl.style.backgroundColor = color;

  //@ts-ignore
  const pokemon_ja_type = pokeType.map((type:any) => type.type.name);
  const ja_type = main_ja_types.find(
    (type) => pokemon_ja_type.indexOf(type) > -1
  );
  //@ts-ignore
  const jaType = ja_types[ja_type];

  const pokemonInnerHTML = `
  <div class="img-container">
    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png" alt="">
  </div>
  <div class="info">
    <span class="number">#${id}</span>
    <h3 class="name">${pokeName}</h3>
    <small class="type">タイプ: <span>${jaType}</span></small>
  </div>
  `;

  pokemonEl.innerHTML = pokemonInnerHTML;
  poke_container.appendChild(pokemonEl);
};

fetchPokemons();

let pokeNum = 0;
$(document).on("click", ".box", function (event) {
  // クリックされた要素のidを取得
  // attrメソッドとは何か？HTML要素の 属性 を取得,変更,新規追加できるメソッド
  //@ts-ignore
  pokeNum = $(this).attr("id");

  // details部の表示関数を実行。
  DetailsDisplay();

  // main部分を非表示。
  let main = <HTMLDivElement>document.getElementById("poke-container");
  main.remove();
});


/**
 *  ポケモンをクリックした際のポケモンの詳細をcreateして表示
 */
async function DetailsDisplay() {
  // APIでjsonを取得する
  let res = await fetch("https://pokeapi.co/api/v2/pokemon-species/" + pokeNum);
  let data = await res.json();

  // ID、名前、属名、説明文を取得する。
  let pokeId = data["id"];
  let pokeName = data["names"][0]["name"];
  let pokeGenus = data["genera"][0]["genus"];
  let pokeFlavorText = data["flavor_text_entries"][29]["flavor_text"];

  // 画像、たかさ、おもさのデータを取得するためエンドポイントを変える。
  pokemonUrl = data["varieties"][0]["pokemon"]["url"];
  res = await fetch(pokemonUrl);
  data = await res.json();

  // たかさ、おもさを取得
  let pokeHeight = data["height"] / 10;
  let pokeWeight = data["weight"] / 10;

  // 1から2の乱数を生成
  let random = Math.floor(Math.random() * 2) + 1;

  let pokeImg_front;
  let pokeImg_back;

  // 画像を取得 色違いにするために1から2の乱数を使用
  if (random == 1) {
    pokeImg_front = data["sprites"]["front_default"];
    pokeImg_back = data["sprites"]["back_default"];
  } else if (random == 2) {
    pokeImg_front = data["sprites"]["front_shiny"];
    pokeImg_back = data["sprites"]["back_shiny"];
  }

  // divを生成して、imn_boxクラスを追加する。
  let div = document.createElement("div");
  div.className = "img-box";

  // img要素を生成(正面画像)
  let img = document.createElement("img");
  img.src = pokeImg_front; // 画像パスを追加
  div.appendChild(img); // img要素をdiv要素の子要素に追加
  // img要素を生成(うしろ画像)
  img = document.createElement("img");
  img.src = pokeImg_back;
  div.appendChild(img);

  // ポケモンの番号を生成
  let poke_number = document.createElement("p");
  poke_number.textContent = "No." + pokeId;
  div.appendChild(poke_number);

  // 画像部分（img-box）を表示
  const details = <HTMLDivElement>document.getElementById("details");
  details.appendChild(div);

  // 詳細部を作成
  div = document.createElement("div");
  div.className = "details-box";

  // リザードン
  let pokemon_name = document.createElement("p");
  pokemon_name.textContent = pokeName;
  div.appendChild(pokemon_name);

  // 属名 かえんぽけもん
  let classification = document.createElement("p");
  classification.textContent = pokeGenus;
  console.log(pokeGenus);
  div.appendChild(classification);

  // 高さ 1.3m
  let height = document.createElement("p");
  height.textContent = "たかさ " + pokeHeight + "m";
  div.appendChild(height);

  // 体重 90.5kg
  let weight = document.createElement("p");
  weight.textContent = "おもさ " + pokeWeight + "kg";
  div.appendChild(weight);

  // 詳細部分を表示
  details.appendChild(div);

  // 説明部を生成
  div = document.createElement("div");
  div.className = "flavor-text-box";

  let flavorText = document.createElement("p");
  flavorText.textContent = pokeFlavorText;

  div.appendChild(flavorText);

  // 説明部を表示
  details.after(div);
}

