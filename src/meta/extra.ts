export type ExtraKind = 'helmet' | 'stairs' | 'sidewalk' | 'knife' | 'iron' | 'kettle' | 'glass' | 'battery' | 'bag' | 'medicine' | 'oven';
export interface ExtraDefinition {
  kind: ExtraKind; cmd: string; card: string; topic: 'home' | 'street';
  rule: string; action: 'drag' | 'hold' | 'tap';
}
export const EXTRA_LEVELS: readonly ExtraDefinition[] = [
  {kind:'helmet',cmd:'ДУУЛГАА ӨМС!',card:'Дугуйн дуулга',topic:'street',action:'drag',rule:'Дугуй унахдаа өөрт таарсан дуулга өмсөж, оосрыг нь том хүнээр шалгуул.'},
  {kind:'stairs',cmd:'БАРИУЛААС БАРЬ!',card:'Шатны бариул',topic:'home',action:'hold',rule:'Шатаар тайван алхаж, бариулаас барь. Үсэрч, гүйж болохгүй.'},
  {kind:'sidewalk',cmd:'ЯВГАН ЗАМААР ЯВ!',card:'Явган хүний зам',topic:'street',action:'drag',rule:'Явган хүний замаар том хүнтэй хамт яв. Машины зам руу бүү ор.'},
  {kind:'knife',cmd:'ХУТГАНД БҮҮ ХҮР!',card:'Хурц хутга',topic:'home',action:'tap',rule:'Хурц хутганд бүү хүр. Том хүнд хэлж, холдуулж тавиул.'},
  {kind:'iron',cmd:'ИНДҮҮНЭЭС ХОЛД!',card:'Халуун индүү',topic:'home',action:'tap',rule:'Индүү халуун байж болно. Бүү хүр, утаснаас нь бүү тат. Том хүнд хэл.'},
  {kind:'kettle',cmd:'ДАНХАНД БҮҮ ХҮР!',card:'Халуун данх',topic:'home',action:'tap',rule:'Халуун данх, усыг том хүнээр зөөлгө. Утас, бариулаас нь бүү тат.'},
  {kind:'glass',cmd:'ХАГАРХАЙГААС ХОЛД!',card:'Хагархай шил',topic:'home',action:'tap',rule:'Хагархай шилэнд бүү хүр. Хол зогсож, том хүнээр цэвэрлүүл.'},
  {kind:'battery',cmd:'ЗАЙНД БҮҮ ХҮР!',card:'Товчин зай',topic:'home',action:'tap',rule:'Жижиг товчин зайгаар бүү тогло. Ам, хамар, чихэндээ бүү хий. Том хүнд хэл.'},
  {kind:'bag',cmd:'УУТААР БҮҮ ТОГЛО!',card:'Гялгар уут',topic:'home',action:'tap',rule:'Гялгар уутыг толгой, нүүрэндээ бүү угла. Том хүнд өгч холдуул.'},
  {kind:'medicine',cmd:'ЭМИЙГ ТОМ ХҮН ӨГНӨ!',card:'Эм бол чихэр биш',topic:'home',action:'tap',rule:'Эмийг чихэр гэж бүү бод. Зөвхөн том хүний өгсөн эмийг хэрэглэ.'},
  {kind:'oven',cmd:'ШАРАХ ШҮҮГЭЭНЭЭС ХОЛД!',card:'Халуун шарах шүүгээ',topic:'home',action:'tap',rule:'Хоол хийж буй шарах шүүгээ, зуухнаас хол бай. Том хүнээс тусламж хүс.'},
];
