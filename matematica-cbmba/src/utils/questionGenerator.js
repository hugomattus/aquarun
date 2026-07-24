function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatCurrency(n) {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function simplifyFraction(num, den) {
  if (den === 0) return [num, den];
  const d = gcd(Math.abs(num), Math.abs(den));
  let sn = num / d, sd = den / d;
  if (sd < 0) { sn = -sn; sd = -sd; }
  return [sn, sd];
}

function formatFraction(num, den) {
  const [sn, sd] = simplifyFraction(num, den);
  return sd === 1 ? String(sn) : `${sn}/${sd}`;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

function comb(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let r = 1;
  for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1);
  return Math.round(r);
}

function round2(n) { return Math.round(n * 100) / 100; }

function fat(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }

function withTemplates(...fns) {
  return () => pick(fns)();
}

const NOMES_MASC = ['Joao', 'Pedro', 'Carlos', 'Marcos', 'Lucas', 'Rafael', 'Bruno', 'Diego', 'Felipe', 'Andre', 'Thiago', 'Gustavo', 'Leandro', 'Ricardo', 'Paulo', 'Sergio', 'Roberto', 'Claudio', 'Fernando', 'Eduardo'];
const NOMES_FEM = ['Ana', 'Maria', 'Julia', 'Camila', 'Fernanda', 'Patricia', 'Renata', 'Beatriz', 'Carla', 'Lucia', 'Vanessa', 'Priscila', 'Aline', 'Daniela', 'Roberta', 'Adriana', 'Cristina', 'Monica', 'Sandra', 'Tereza'];
const NOMES = [...NOMES_MASC, ...NOMES_FEM];
const EQUIPAMENTOS = ['extintores', 'mangueiras', 'capacetes', 'cordas', 'macas', 'oculos de protecao', 'luvas', 'bota de borracha', 'radios', 'lanternas', 'manteigas', 'abafadores', 'casacos', 'cintos de seguranca', 'hidrantes'];
const CIDADES_CBMBAS = ['Salvador', 'Feira de Santana', 'Vitoria da Conquista', 'Ilheus', 'Juazeiro'];
const CIDADES = [...CIDADES_CBMBAS, 'Barreiras', 'Itaberaba', 'Teixeira de Freitas', 'Porto Seguro', 'Simoes Filho'];
const LOCAIS = ['quartel', 'base operacional', 'destacamento', 'posto de emergacia', 'centro de treinamento', 'area de operacoes'];
const ACOES = ['realizou', 'executou', 'completou', 'finalizou', 'realizou', 'desempenhou'];
const TURNOS = ['manha', 'tarde', 'noite', 'primeiro turno', 'segundo turno'];
const EQUIPES = ['equipe Alpha', 'equipe Bravo', 'equipe Charlie', 'primeira secao', 'segunda secao', 'terceira secao', 'grupo A', 'grupo B'];

const topicGenerators = {

  // ============================================================
  // ADICAO
  // ============================================================
  adicao: [
    withTemplates(
      () => {
        const a = randInt(15, 60), b = randInt(10, a);
        return { question: `Calcule: ${a} + ${b}`, answer: a + b, options: shuffle([a + b, a + b + randInt(5, 15), a - b, a + b + randInt(20, 30)]) };
      },
      () => {
        const a = randInt(30, 90), b = randInt(10, a);
        return { question: `Na manha, ${pick(EQUIPES)} executou ${a} ${pick(ACOES)}. A tarde, executou ${b}. Quantas acoes no total?`, answer: a + b, options: shuffle([a + b, a + b + 5, a * 2, a + b - 3]) };
      },
      () => {
        const a = randInt(50, 200), b = randInt(30, a);
        return { question: `O ${pick(LOCAIS)} de ${pick(CIDADES)} recebeu ${a} cadastros. Apos auditoria, mais ${b} foram confirmados. Total final?`, answer: a + b, options: shuffle([a + b, a + b + 10, a - b, a * 2]) };
      },
    ),
    withTemplates(
      () => {
        const a = randInt(200, 800), b = randInt(200, 800), c = randInt(100, 400);
        return { question: `Tres caminhoes-tanque descarregaram ${a} L, ${b} L e ${c} L no reservatorio central. Qual o volume total recebido?`, answer: a + b + c, options: shuffle([a + b + c, a + b + c + 50, a + b, a + b + c - 100]) };
      },
      () => {
        const a = randInt(300, 700), b = randInt(200, 600), c = randInt(150, 500);
        return { question: `O ${pick(LOCAIS)} distribuiu ${a} kits de socorro na ${pick(TURNOS[0])}turno da manha, ${b} no turno da tarde e ${c} no noturno. Quantos kits no total?`, answer: a + b + c, options: shuffle([a + b + c, a + b + c + 30, a + b, a + b - c]) };
      },
      () => {
        const a = randInt(100, 500), b = randInt(100, 500), c = randInt(100, 500);
        return { question: `Um ${pick(LOCAIS)} recebeu ${a} requisicoes de ${pick(CIDADES_CBMBAS)}, ${b} de ${pick(CIDADES_CBMBAS)} e ${c} de ${pick(CIDADES_CBMBAS)}. Total de requisicoes?`, answer: a + b + c, options: shuffle([a + b + c, a + b + 10, a * 3, a + b + c - 20]) };
      },
    ),
    withTemplates(
      () => {
        const t1 = randFloat(50, 200, 1), t2 = randFloat(30, 150, 1), t3 = randFloat(20, 100, 1);
        const total = parseFloat((t1 + t2 + t3).toFixed(1));
        return { question: `Tres viaturas abasteceram ${t1} L, ${t2} L e ${t3} L. Somando tudo, qual a quantidade total de combustivel?`, answer: total, options: shuffle([total, parseFloat((total + 10).toFixed(1)), parseFloat((t1 + t2).toFixed(1)), parseFloat((total - 5).toFixed(1))]) };
      },
      () => {
        const t1 = randFloat(100, 400, 1), t2 = randFloat(50, 300, 1);
        const media = parseFloat(((t1 + t2) / 2).toFixed(1));
        return { question: `O ${pick(NOMES_MASC)} media o consumo de 2 viaturas. A A gastou ${t1} L e a B ${t2} L. Consumo combinado?`, answer: parseFloat((t1 + t2).toFixed(1)), options: shuffle([parseFloat((t1 + t2).toFixed(1)), media, parseFloat((t1 * t2).toFixed(1)), parseFloat((t1 + t2 + 15).toFixed(1))]) };
      },
      () => {
        const a = randFloat(80, 300, 1), b = randFloat(80, 300, 1), c = randFloat(80, 300, 1);
        const total = parseFloat((a + b + c).toFixed(1));
        return { question: `Durante ${pick(TURNOS)}, o ${pick(LOCAIS)} acumulou ${a} L de agua, ${b} L de agua e mais ${c} L de reservas. Total no deposito?`, answer: total, options: shuffle([total, parseFloat((a + b).toFixed(1)), parseFloat((total - 20).toFixed(1)), parseFloat((a * 3).toFixed(1))]) };
      },
    ),
    withTemplates(
      () => {
        const base = randInt(40, 100);
        const cia1 = randInt(10, 30), cia2 = randInt(10, 30), cia3 = randInt(10, 30);
        const total = base + cia1 + cia2 + cia3;
        return { question: `O effectivo do ${pick(LOCAIS)} era de ${base} militares. Chegaram ${cia1} da 1a Cia, ${cia2} da 2a e ${cia3} da 3a. Qual o effectivo total?`, answer: total, options: shuffle([total, base + cia1 + cia2, total + randInt(5, 15), base * 2]) };
      },
      () => {
        const efetivo = randInt(60, 200), turmas = randInt(3, 6), porTurma = randInt(15, 40);
        const total = efetivo + turmas * porTurma;
        return { question: `O ${pick(LOCAIS)} tinha ${efetivo} bombeiros. ${turmas} turmas de instrucao com ${porTurma} alunos cada foram incorporadas. Effectivo total?`, answer: total, options: shuffle([total, efetivo + turmas, turmas * porTurma, total + 10]) };
      },
    ),
    withTemplates(
      () => {
        const total = randInt(200, 500);
        const umTerco = Math.round(total / 3);
        const resto = total - umTerco;
        const metadeResto = Math.round(resto / 2);
        const soma = umTerco + metadeResto;
        return { question: `${pick(NOMES_MASC)} informou ${total} militares. ${formatFraction(1, 3)} esta na base e metade do restante em patrulha. Quantos na base ou em patrulha?`, answer: soma, options: shuffle([soma, total, umTerco, metadeResto]) };
      },
      () => {
        const a = randInt(3, 8), b = randInt(2, 6), c = randInt(50, 200);
        const d = randInt(2, 5);
        const total = a + b + c + d;
        return { question: `Em um exercicio, a equipe A levou ${a} h, a B levou ${b} h e a C levou ${c} min + ${d} h. Total de horas combinadas?`, answer: a + b + d + c, options: shuffle([a + b + d + c, a + b + c, a * b + c + d, total + 10]) };
      },
    ),
  ],

  // ============================================================
  // SUBTRACAO
  // ============================================================
  subtracao: [
    withTemplates(
      () => {
        const total = randInt(80, 300), aloc = randInt(30, total - 20);
        return { question: `Um estoque de ${total} ${pick(EQUIPAMENTOS)} teve ${aloc} distribuidos. Quantos restam?`, answer: total - aloc, options: shuffle([total - aloc, total - aloc + 10, total - aloc - 5, total]) };
      },
      () => {
        const total = randInt(200, 800), removidos = randInt(50, total - 50);
        return { question: `Calcule: ${total} - ${removidos}`, answer: total - removidos, options: shuffle([total - removidos, total + removidos, total - removidos + 15, removidos - total]) };
      },
      () => {
        const tanque = randInt(500, 3000), usado = randInt(100, tanque - 100);
        return { question: `Um tanque de ${tanque} L foi ${usado == 1 ? 'usado' : 'utilizado'} em ${pick(ACOES)}. Qual o saldo?`, answer: tanque - usado, options: shuffle([tanque - usado, tanque + usado, usado, tanque - usado + 50]) };
      },
    ),
    withTemplates(
      () => {
        const orc = randInt(80000, 300000), g1 = randInt(15000, 50000), g2 = randInt(10000, 30000);
        return { question: `Orcamento: ${formatCurrency(orc)}. Equipamentos: ${formatCurrency(g1)}. Combustivel: ${formatCurrency(g2)}. Saldo?`, answer: orc - g1 - g2, options: shuffle([orc - g1 - g2, orc - g1, orc - g1 - g2 + 5000, orc - g2]) };
      },
      () => {
        const a = randInt(10000, 80000), b = randInt(5000, 30000), c = randInt(2000, 15000);
        return { question: `A prefeitura destinou ${formatCurrency(a)} para ${pick(LOCAIS)}. Gastos: ${formatCurrency(b)} em pessoal e ${formatCurrency(c)} em materiais. Quanto sobrou?`, answer: a - b - c, options: shuffle([a - b - c, a - b, a - c, a - b - c + 1000]) };
      },
    ),
    withTemplates(
      () => {
        const a = randFloat(100, 500, 1), b = randFloat(20, a - 10, 1);
        return { question: `Um reservatorio com ${a} L teve ${b} L retirados. Restam?`, answer: parseFloat((a - b).toFixed(1)), options: shuffle([parseFloat((a - b).toFixed(1)), parseFloat((a + b).toFixed(1)), parseFloat((a - b + 10).toFixed(1)), parseFloat((a - b - 5).toFixed(1))]) };
      },
      () => {
        const a = randFloat(200, 800, 1), b = randFloat(50, a - 50, 1);
        return { question: `O consumo medio diario e ${a} L. Ontem foram usados ${b} L a mais que a media. Consumo real?`, answer: parseFloat((a + b).toFixed(1)), options: shuffle([parseFloat((a + b).toFixed(1)), parseFloat((a - b).toFixed(1)), parseFloat((a * 2).toFixed(1)), parseFloat((a + b - 10).toFixed(1))]) };
      },
    ),
    withTemplates(
      () => {
        const ef = randInt(150, 600), ap = randInt(15, 60), lc = randInt(8, 35), fr = randInt(5, 25), doente = randInt(3, 15);
        const presentes = ef - ap - lc - fr - doente;
        return { question: `Effectivo: ${ef}. Ausentes: ${ap} aposentados, ${lc} licenca, ${fr} ferias, ${doente} afastados. Quantos servindo?`, answer: presentes, options: shuffle([presentes, ef - ap - lc - fr, presentes + 10, ef - ap]) };
      },
    ),
    withTemplates(
      () => {
        const litros = randInt(5000, 12000), uso = randInt(800, 2000), evap = randInt(100, 400), distracao = randInt(200, 500);
        const restante = litros - uso - evap;
        return { question: `Reservatorio: ${litros.toLocaleString('pt-BR')} L. Combate: ${uso} L. Evaporacao: ${evap} L. Requisicao cancelada de ${distracao} L. Qual a agua restante?`, answer: restante, options: shuffle([restante, litros - uso - evap - distracao, litros - uso, litros - distracao]) };
      },
    ),
  ],

  // ============================================================
  // MULTIPLICACAO
  // ============================================================
  multiplicacao: [
    withTemplates(
      () => {
        const a = randInt(6, 15), b = randInt(3, 12);
        return { question: `Calcule: ${a} x ${b}`, answer: a * b, options: shuffle([a * b, a * b + 10, a + b, a * b - 5]) };
      },
      () => {
        const a = randInt(4, 12), b = randInt(4, 12);
        return { question: `${pick(NOMES_MASC)} precisa organizar ${a} fileiras com ${b} ${pick(EQUIPAMENTOS)} cada. Quantos no total?`, answer: a * b, options: shuffle([a * b, a + b, a * b + 6, (a + 1) * b]) };
      },
    ),
    withTemplates(
      () => {
        const c = randFloat(8, 30, 1), d = randInt(5, 20);
        return { question: `Um veiculo consome ${c} L/km. Em ${d} km, quantos litros?`, answer: parseFloat((c * d).toFixed(1)), options: shuffle([parseFloat((c * d).toFixed(1)), parseFloat((c + d).toFixed(1)), parseFloat((c * d + 10).toFixed(1)), parseFloat((c * (d + 3)).toFixed(1))]) };
      },
      () => {
        const preco = randFloat(2, 15, 2), qtd = randInt(10, 50);
        return { question: `Cada unidade de ${pick(EQUIPAMENTOS)} custa ${formatCurrency(preco)}. ${qtd} unidades custam?`, answer: parseFloat((preco * qtd).toFixed(2)), options: shuffle([parseFloat((preco * qtd).toFixed(2)), parseFloat((preco + qtd).toFixed(2)), parseFloat((preco * qtd + 20).toFixed(2)), parseFloat((preco * qtd - 10).toFixed(2))]) };
      },
    ),
    withTemplates(
      () => {
        const sqm = randFloat(50, 300, 1), p = randFloat(3, 20, 2);
        return { question: `${sqm} m\u00B2 de piso a ${formatCurrency(p)}/m\u00B2. Custo total?`, answer: parseFloat((sqm * p).toFixed(2)), options: shuffle([parseFloat((sqm * p).toFixed(2)), parseFloat((sqm + p).toFixed(2)), parseFloat((sqm * p + 100).toFixed(2)), parseFloat((sqm * (p + 5)).toFixed(2))]) };
      },
    ),
    withTemplates(
      () => {
        const dias = randInt(5, 20), sld = randInt(8, 30), racao = randInt(2, 5);
        return { question: `Operacao de ${dias} dias com ${sld} soldados. ${racao} kg de racao por dia. Total?`, answer: dias * sld * racao, options: shuffle([dias * sld * racao, dias + sld + racao, dias * sld, dias * sld * racao + 100]) };
      },
      () => {
        const fil = randInt(5, 12), pf = randInt(6, 15), h = randInt(2, 8), rep = randInt(2, 4);
        const total = fil * pf * h * rep;
        return { question: `${fil} fileiras com ${pf} militares, ${h} exercicios/hora durante ${rep} horas. Total de exercicios?`, answer: total, options: shuffle([total, fil * pf * h, total + 20, fil * pf * rep]) };
      },
    ),
    withTemplates(
      () => {
        const veiculos = randInt(10, 30), cap = randInt(500, 2000);
        const pct = pick([60, 70, 75, 80]);
        const disp = Math.floor(veiculos * pct / 100);
        const total = disp * cap;
        return { question: `${veiculos} veiculos com ${cap} L cada. Se ${pct}% estiverem disponiveis, capacidade total disponivel?`, answer: total, options: shuffle([total, veiculos * cap, disp * (cap + 100), total + 500]) };
      },
    ),
  ],

  // ============================================================
  // DIVISAO
  // ============================================================
  divisao: [
    withTemplates(
      () => {
        const total = randInt(48, 180), g = randInt(4, 12);
        return { question: `${total} ${pick(EQUIPAMENTOS)} sao distribuidos entre ${g} bases igualmente. Quantos por base?`, answer: total / g, options: shuffle([total / g, total / g + 2, total / (g - 1), total / g - 1]) };
      },
      () => {
        const total = randInt(60, 240), g = randInt(3, 8);
        return { question: `Calcule: ${total} / ${g}`, answer: total / g, options: shuffle([total / g, total / g + 1, total * g, total / g - 2]) };
      },
    ),
    withTemplates(
      () => {
        const dist = randFloat(80, 400), t = randFloat(1.5, 5, 1);
        return { question: `Percurso de ${dist} km percorrido em ${t} h. Velocidade media?`, answer: parseFloat((dist / t).toFixed(1)), options: shuffle([parseFloat((dist / t).toFixed(1)), parseFloat((dist * t).toFixed(1)), parseFloat((dist / t + 5).toFixed(1)), parseFloat((dist / (t + 1)).toFixed(1))]) };
      },
      () => {
        const dist = randFloat(50, 300), v = randFloat(30, 100);
        return { question: `Uma viatura viaja a ${v} km/h. Para percorrer ${dist} km, quantas horas?`, answer: parseFloat((dist / v).toFixed(1)), options: shuffle([parseFloat((dist / v).toFixed(1)), parseFloat((dist * v).toFixed(1)), parseFloat((dist / v + 1).toFixed(1)), parseFloat((v / dist).toFixed(1))]) };
      },
    ),
    withTemplates(
      () => {
        const total = randFloat(800, 8000, 2), m = randInt(4, 18);
        return { question: `${formatCurrency(total)} dividido em ${m} parcelas iguais. Valor de cada?`, answer: parseFloat((total / m).toFixed(2)), options: shuffle([parseFloat((total / m).toFixed(2)), parseFloat((total / (m - 1)).toFixed(2)), parseFloat((total / m + 50).toFixed(2)), parseFloat((total / (m + 1)).toFixed(2))]) };
      },
    ),
    withTemplates(
      () => {
        const l = randInt(1000, 5000), c = randInt(3, 10);
        return { question: `${l.toLocaleString('pt-BR')} L de agua sao divididos entre ${c} caminhoes-tanque. Cada um leva quanto?`, answer: Math.round(l / c), options: shuffle([Math.round(l / c), Math.round(l / c) + 20, Math.round(l / (c - 1)), Math.round(l / c) - 10]) };
      },
      () => {
        const ef = randInt(80, 250), esc = randInt(3, 6);
        const pe = Math.floor(ef / esc), rest = ef % esc;
        return { question: `${ef} militares em ${esc} escalas iguais. Por escala e reserva?`, answer: `${pe} por escala, ${rest} reserva`, options: shuffle([`${pe} por escala, ${rest} reserva`, `${pe + 1} por escala, ${esc - rest} reserva`, `${pe} por escala, ${esc} reserva`, `${pe + rest} por escala, 0 reserva`]) };
      },
    ),
    withTemplates(
      () => {
        const totalRegistros = randInt(200, 800), equipes = randInt(3, 8);
        const porEquipe = Math.ceil(totalRegistros / equipes);
        const ultimaEquipe = totalRegistros - (equipes - 1) * porEquipe;
        return { question: `${totalRegistros} registros distribuidos entre ${equipes} equipes. A ultima recebe menos. Quantos ela processa?`, answer: ultimaEquipe, options: shuffle([ultimaEquipe, porEquipe, porEquipe - 1, Math.floor(totalRegistros / equipes)]) };
      },
    ),
  ],

  // ============================================================
  // EXPRESSOES NUMERICAS
  // ============================================================
  expressoes: [
    withTemplates(
      () => {
        const a = randInt(3, 15), b = randInt(2, 10), c = randInt(1, 8);
        return { question: `Calcule: ${a} + ${b} x ${c}`, answer: a + b * c, options: shuffle([a + b * c, (a + b) * c, a * b + c, a + b * c + 5]) };
      },
      () => {
        const a = randInt(5, 25), b = randInt(2, 6), c = randInt(1, 5), d = randInt(2, 8);
        return { question: `Resolva: (${a} - ${c}) x ${b} + ${d}`, answer: (a - c) * b + d, options: shuffle([(a - c) * b + d, a * b - c + d, (a + d) * b - c, a - c * b + d]) };
      },
      () => {
        const a = randInt(2, 10), b = randInt(2, 10), c = randInt(1, 8), d = randInt(1, 5);
        return { question: `Qual o resultado de (${a} + ${b}) x (${c} + ${d})?`, answer: (a + b) * (c + d), options: shuffle([(a + b) * (c + d), a * c + b * d, a + b + c + d, (a + b) * (c + d) + 10]) };
      },
    ),
    withTemplates(
      () => {
        const a = randInt(10, 60), b = randInt(2, 8), c = randInt(5, 20);
        return { question: `${a} viaturas em emergencia equivalem a ${b} x plantao + ${c}. Qual o resultado?`, answer: a * b + c, options: shuffle([a * b + c, a * b, a + b + c, a * (b + c)]) };
      },
    ),
    withTemplates(
      () => {
        const a = randInt(2, 8), b = randInt(3, 12), c = randInt(1, 5);
        return { question: `${a} prateleiras com ${b} extintores cada. Retirados ${c} vencidos de cada. Quantos validos?`, answer: a * (b - c), options: shuffle([a * (b - c), a * b - c, a * b - a * c + c, (a - 1) * b]) };
      },
      () => {
        const a = randInt(3, 10), b = randInt(2, 8), c = randInt(1, 4);
        return { question: `Simplifique: ${a} x (${b} + ${c}) - ${c} x ${a}`, answer: a * b, options: shuffle([a * b, a * (b + c), a * b + c, a * b - c]) };
      },
    ),
    withTemplates(
      () => {
        const x = randInt(10, 50), metade = Math.round(x / 2), dobro = metade * 2;
        const terco = Math.round(dobro / 3), resultado = dobro - terco + metade;
        return { question: `O orcamento e ${formatCurrency(x)}. Metade para equipamentos, subtrair 1/3 do dobro do que usou, somar a metade original. Resultado?`, answer: resultado, options: shuffle([resultado, x, metade, dobro - terco]) };
      },
    ),
  ],

  // ============================================================
  // FRACOES
  // ============================================================
  fracao: [
    () => {
      const d = randInt(4, 12), n1 = randInt(1, Math.floor(d / 2) - 1), n2 = randInt(1, d - n1 - 1);
      const [sn, sd] = simplifyFraction(n1 + n2, d);
      return { question: `${formatFraction(n1, d)} cozinha + ${formatFraction(n2, d)} limpeza = ?`, answer: formatFraction(sn, sd), options: shuffle([formatFraction(sn, sd), formatFraction(n1 + n2 + 1, d), formatFraction(n1 * n2, d), formatFraction(n1 + n2, d * 2)]) };
    },
    () => {
      const d = randInt(4, 12), n1 = randInt(Math.floor(d / 3), d - 2), n2 = randInt(1, n1 - 1);
      const [sn, sd] = simplifyFraction(n1 - n2, d);
      return { question: `${formatFraction(n1, d)} plantao - ${formatFraction(n2, d)} treino = ?`, answer: formatFraction(sn, sd), options: shuffle([formatFraction(sn, sd), formatFraction(n1 + n2, d), formatFraction(n1 * n2, d), formatFraction(n1, d + n2)]) };
    },
    () => {
      const n1 = randInt(1, 8), d1 = randInt(2, 8), n2 = randInt(1, 8), d2 = randInt(2, 8);
      const [sn, sd] = simplifyFraction(n1 * n2, d1 * d2);
      return { question: `${formatFraction(n1, d1)} x ${formatFraction(n2, d2)} = ?`, answer: formatFraction(sn, sd), options: shuffle([formatFraction(sn, sd), formatFraction(n1 + n2, d1 + d2), formatFraction(n1 * d2, d1 * n2), formatFraction(n1 + n2, d1 * d2)]) };
    },
    () => {
      const n1 = randInt(1, 5), d = randInt(3, 8), n2 = randInt(1, 5);
      const [sn, sd] = simplifyFraction(n1 * n2, d * d);
      return { question: `Prob chuva ${formatFraction(n1, d)}, incendio ${formatFraction(n2, d)}. Ambos?`, answer: formatFraction(sn, sd), options: shuffle([formatFraction(sn, sd), formatFraction(n1 + n2, d), formatFraction(n1 * n2, d * 2), formatFraction(n1, d + n2)]) };
    },
    // Nivel 4
    () => {
      const d = randInt(6, 15), n1 = randInt(1, Math.floor(d / 3)), n2 = randInt(1, Math.floor(d / 3));
      const n3 = d - n1 - n2;
      if (n3 <= 0) return topicGenerators.fracao[3]();
      return { question: `${formatFraction(n1, d)} em ${pick(CIDADES_CBMBAS)}, ${formatFraction(n2, d)} em ${pick(CIDADES_CBMBAS.slice(1))}, restante em ${pick(CIDADES_CBMBAS.slice(2))}. Que fracao em ${pick(CIDADES_CBMBAS.slice(2))}?`, answer: formatFraction(n3, d), options: shuffle([formatFraction(n3, d), formatFraction(n3 + 1, d), formatFraction(n1 + n2, d), formatFraction(n3 - 1, d)]) };
    },
    // Nivel 5
    () => {
      const n1 = randInt(1, 5), d = randInt(4, 10);
      const restoNum = d - n1;
      return { question: `Destacamento usou ${formatFraction(n1, d)} dos extintores no 1o atendimento e metade do restante no 2o. Que fracao foi usada no 2o atendimento?`, answer: formatFraction(restoNum, 2 * d), options: shuffle([formatFraction(restoNum, 2 * d), formatFraction(n1, d), formatFraction(restoNum, d), formatFraction(n1, 2 * d)]) };
    },
  ],

  // ============================================================
  // PROPORCAO
  // ============================================================
  proporcao: [
    () => {
      const a = randInt(3, 10), b = randInt(5, 20), c = randInt(3, 10);
      const x = (b * c) / a;
      return { question: `${a} bmb = ${b} focos/h. ${c} bmb = ?`, answer: Number.isInteger(x) ? x : round2(x), options: shuffle([Number.isInteger(x) ? x : round2(x), b + c, a * c, b * c]) };
    },
    () => {
      const cam = randInt(3, 10), ton = randInt(6, 30), cam2 = randInt(3, 10);
      return { question: `${cam} cam = ${ton} t. ${cam2} cam = ?`, answer: round2((ton * cam2) / cam), options: shuffle([round2((ton * cam2) / cam), ton + cam2, cam * cam2, ton * cam2]) };
    },
    () => {
      const t1 = randInt(3, 10), p1 = randInt(5, 20), p2 = randInt(5, 20);
      return { question: `${p1} bmb = ${t1}d. ${p2} bmb = ?d`, answer: round2((t1 * p1) / p2), options: shuffle([round2((t1 * p1) / p2), t1 + p2, p1 / p2, t1 * p2]) };
    },
    () => {
      const fam = randInt(3, 10), tanq = randInt(2, 6);
      return { question: `1 tanque = ${fam} fam. ${tanq} tanques = ?`, answer: fam * tanq, options: shuffle([fam * tanq, fam + tanq, fam * (tanq + 1), fam * tanq + 3]) };
    },
    // Nivel 4
    () => {
      const h1 = randInt(6, 14), p1 = randInt(5, 20), h2 = randInt(3, h1 - 1);
      const p2 = Math.ceil((h1 * p1) / h2);
      return { question: `${p1} bmb = ${h1}h. Pra ${h2}h, quantos?`, answer: p2, options: shuffle([p2, p1 + 2, p1 - 1, p2 + 3]) };
    },
    // Nivel 5 - inversa com distracao
    () => {
      const m1 = randInt(4, 10), d1 = randInt(10, 30), m2 = randInt(4, 10), dist = randInt(2, 5);
      return { question: `${m1} maquinas = ${d1} dias. Se ${m2} + ${dist} maquinas, quantos dias?`, answer: round2((d1 * m1) / (m2 + dist)), options: shuffle([round2((d1 * m1) / (m2 + dist)), round2((d1 * m1) / m2), d1 + m2, d1 / m2]) };
    },
  ],

  // ============================================================
  // REGRA DE TRES
  // ============================================================
  regra_de_tres: [
    () => {
      const a = randInt(3, 12), b = randInt(100, 500), c = randInt(3, 12);
      const x = (b * c) / a;
      return { question: `${a} extint = ${formatCurrency(b)}. ${c} extint = ?`, answer: Number.isInteger(x) ? x : round2(x), options: shuffle([Number.isInteger(x) ? x : round2(x), b + c, a * c, b * c]) };
    },
    () => {
      const m = randInt(3, 10), h = randInt(6, 24), m2 = randInt(3, 10);
      return { question: `${m} eq = ${h}h. ${m2} eq = ?h`, answer: round2((h * m) / m2), options: shuffle([round2((h * m) / m2), h + m2, h * m2, h - m2]) };
    },
    () => {
      const p = randInt(5, 20), d = randInt(10, 60), p2 = randInt(5, 20);
      return { question: `${p} sld = ${d} dias. ${p2} sld = ?d`, answer: round2((d * p) / p2), options: shuffle([round2((d * p) / p2), d + p2, p * p2, d / p2]) };
    },
    () => {
      const cam = randInt(3, 8), litros = randInt(500, 2000), dias = randInt(2, 5);
      return { question: `${cam} cam x ${litros} L. 50L/fam/dia. Fam/${dias}d?`, answer: Math.floor((cam * litros) / (50 * dias)), options: shuffle([Math.floor((cam * litros) / (50 * dias)), litros / 50, cam * dias, Math.floor((cam * litros) / (50 * dias)) + 5]) };
    },
    // Nivel 4
    () => {
      const a = randInt(4, 15), b = randFloat(2, 20), c = randInt(4, 15);
      return { question: `${a} ${pick(EQUIPAMENTOS)} = ${b} kg. ${c} equip. = ?`, answer: round2((b * c) / a), options: shuffle([round2((b * c) / a), b + c, a * c, b * c]) };
    },
    // Nivel 5 - regra de tres composta
    () => {
      const cam1 = randInt(3, 6), tanque1 = randInt(500, 1500), fam1 = randInt(10, 30), dias1 = randInt(2, 4);
      const cam2 = randInt(3, 8), dias2 = randInt(3, 6);
      const litrosTotal = cam1 * tanque1;
      const fam2 = Math.floor(litrosTotal / (50 * dias2));
      return { question: `${cam1} cam x ${tanque1} L suprem ${fam1} fam por ${dias1}d. Se ${cam2} cam atendem ${fam2} fam por ${dias2}d, sera suficiente? (resp: num fam/${dias2}d)`, answer: fam2, options: shuffle([fam2, fam1, fam2 + 5, fam1 + 3]) };
    },
  ],

  // ============================================================
  // PORCENTAGEM
  // ============================================================
  porcentagem: [
    () => {
      const v = randInt(200, 2000), p = pick([10, 15, 20, 25, 30, 50]);
      return { question: `Capacete: ${formatCurrency(v)} com ${p}% off. Desconto?`, answer: round2(v * p / 100), options: shuffle([round2(v * p / 100), round2(v - v * p / 100), round2(v * (p + 10) / 100), round2(v + v * p / 100)]) };
    },
    () => {
      const v = randInt(200, 2000), p = pick([10, 15, 20, 25, 30, 50]);
      return { question: `Era ${formatCurrency(v)}, ${p}% off. Valor?`, answer: round2(v * (1 - p / 100)), options: shuffle([round2(v * (1 - p / 100)), round2(v * p / 100), round2(v * (1 + p / 100)), round2(v - p)]) };
    },
    () => {
      const aum = pick([10, 15, 20, 25, 30]), vf = randInt(500, 3000);
      return { question: `Apos ${aum}%, preco: ${formatCurrency(vf)}. Original?`, answer: round2(vf / (1 + aum / 100)), options: shuffle([round2(vf / (1 + aum / 100)), round2(vf * (1 - aum / 100)), round2(vf * aum / 100), round2(vf + vf * aum / 100)]) };
    },
    () => {
      const total = randInt(50, 200), ap = randInt(Math.floor(total * 0.3), Math.floor(total * 0.8));
      return { question: `${total} cand., ${ap} aprovados. Taxa?`, answer: round2((ap / total) * 100), options: shuffle([round2((ap / total) * 100), round2(((total - ap) / total) * 100), round2((ap / total) * 100 + 10), round2(100 - (ap / total) * 100)]) };
    },
    // Nivel 4 - inspirado em IBFC: "50% de dois quintos, sobrou R$160"
    () => {
      const valor = randInt(200, 1000) * 5;
      const doisQuintos = Math.round(valor * 2 / 5);
      const gasto = Math.round(doisQuintos * 50 / 100);
      const sobrou = valor - gasto;
      return { question: `${pick(NOMES_MASC)} gastou 50% de dois quintos do valor que possuia e ainda sobrou ${formatCurrency(sobrou)}. Qual o valor gasto?`, answer: gasto, options: shuffle([gasto, sobrou, valor, gasto + 20]) };
    },
    // Nivel 5 - inspirado em AOCP: 3 parcelas
    () => {
      const total = randInt(10000, 50000);
      const p1 = Math.round(total * 40 / 100);
      const resto1 = total - p1;
      const p2 = Math.round(resto1 / 3);
      const p3 = resto1 - p2;
      return { question: `Orcamento em 3 parcelas: 1a=40% do total, 2a=1/3 do restante, 3a=${formatCurrency(p3)}. Valor total?`, answer: total, options: shuffle([total, p1 + p2 + p3, p3 * 3, total + 5000]) };
    },
  ],

  // ============================================================
  // EQUACOES E SISTEMAS
  // ============================================================
  equacoes: [
    () => {
      const x = randInt(2, 25), a = randInt(2, 10);
      return { question: `${a}x = ${a * x}. x = ?`, answer: x, options: shuffle([x, x + 3, x - 2, a + x]) };
    },
    () => {
      const x = randInt(1, 20), a = randInt(2, 8), b = randInt(5, 30), c = a * x + b;
      return { question: `${a}x + ${b} = ${c}. x = ?`, answer: x, options: shuffle([x, x + 2, x - 1, (c + b) / a]) };
    },
    () => {
      const x = randInt(5, 30), a = randInt(2, 6), b = randInt(10, 50), c = a * x - b;
      return { question: `${a}x - ${b} = ${c}. x = ?`, answer: x, options: shuffle([x, (c - b) / a, (c + b) / a, (c + b) * a]) };
    },
    // Nivel 4 - sistema de equacoes
    () => {
      const x = randInt(2, 12), y = randInt(2, 12);
      const a1 = randInt(1, 4), b1 = randInt(1, 4), c1 = a1 * x + b1 * y;
      const a2 = randInt(1, 4), b2 = randInt(1, 4), c2 = a2 * x + b2 * y;
      if (a1 * b2 === a2 * b1) return topicGenerators.equacoes[3]();
      return { question: `Dest.A: ${a1}G+${b1}P=${c1}t. Dest.B: ${a2}G+${b2}P=${c2}t. Capacidade? (G=x, P=y)`, answer: `x=${x}, y=${y}`, options: shuffle([`x=${x}, y=${y}`, `x=${x+1}, y=${y}`, `x=${x}, y=${y+1}`, `x=${y}, y=${x}`]) };
    },
    // Nivel 5 - equacao do enunciado
    () => {
      const x = randInt(10, 50);
      const resultado = 2 * x - 10 + x;
      return { question: `Pense num numero. Some o dobro com o original e subtraia 10. Resultado: ${resultado}. Qual o numero?`, answer: x, options: shuffle([x, x + 5, x - 5, resultado / 3]) };
    },
  ],

  // ============================================================
  // FUNCOES
  // ============================================================
  funcoes: [
    () => {
      const a = randInt(1, 5), b = randInt(-10, 10), x = randInt(1, 10);
      const fx = a * x + b;
      return { question: `f(x)=${a}x${b >= 0 ? '+' : ''}${b}. f(${x})?`, answer: fx, options: shuffle([fx, fx + 3, a * (x + 1) + b, a * x - b]) };
    },
    () => {
      const a = randInt(1, 5), x = randInt(1, 8);
      return { question: `f(x)=${a}x\u00B2. Area com lado ${x}m?`, answer: a * x * x, options: shuffle([a * x * x, a * x * x + 10, a * x, a * x + x]) };
    },
    () => {
      const a = randInt(2, 8), b = randInt(-5, 5), x = randInt(1, 10);
      return { question: `f(x)=${a}x${b >= 0 ? '+' : ''}${b}. f(${x})?`, answer: a * x + b, options: shuffle([a * x + b, a * (x + 1) + b, a * x - b, a * x + b + 5]) };
    },
    () => {
      const a = randInt(1, 3), b = randInt(1, 5), c = randInt(-10, 10), x = randInt(1, 5);
      const fx = a * x * x + b * x + c;
      return { question: `f(x)=${a}x\u00B2+${b}x${c >= 0 ? '+' : ''}${c}. f(${x})?`, answer: fx, options: shuffle([fx, a * x + b * x + c, a * x * x + b + c, fx + 5]) };
    },
    // Nivel 4 - encontrar x
    () => {
      const a = randInt(1, 5), b = randInt(1, 10), x = randInt(1, 5);
      const fx = a * x + b;
      return { question: `f(x)=${a}x+${b}, f(x)=${fx}. x=?`, answer: x, options: shuffle([x, x + 2, x - 1, fx / a]) };
    },
    // Nivel 5 - funcao composta
    () => {
      const a = randInt(2, 5), b = randInt(1, 5), x = randInt(1, 5);
      const gx = a * x + b;
      const fgx = 2 * gx + 3;
      return { question: `f(x)=2x+3, g(x)=${a}x+${b}. f(g(${x}))?`, answer: fgx, options: shuffle([fgx, fgx + 2, a * x + b + 3, 2 * (a * x + b)]) };
    },
  ],

  // ============================================================
  // GEOMETRIA PLANA
  // ============================================================
  geometria_plana: [
    () => {
      const l = randInt(5, 30);
      return { question: `Quadrado lado ${l}cm. Area?`, answer: l * l, options: shuffle([l * l, l * 4, l * l + 10, l * l * 2]) };
    },
    () => {
      const b = randInt(8, 30), h = randInt(5, 25);
      const a = Number.isInteger((b * h) / 2) ? (b * h) / 2 : round2((b * h) / 2);
      return { question: `Triangulo b=${b}m, h=${h}m. Area?`, answer: a, options: shuffle([a, b * h, b + h, (b + h) * 2]) };
    },
    () => {
      const b = randInt(8, 30), h = randInt(5, 20);
      return { question: `Retangulo ${b}x${h}m. Perimetro?`, answer: (b + h) * 2, options: shuffle([(b + h) * 2, b * h, b + h, (b + h) * 2 + 10]) };
    },
    () => {
      const r = randInt(3, 20);
      return { question: `Circulo r=${r}m. Area? (\u03C0=3,14)`, answer: round2(3.14 * r * r), options: shuffle([round2(3.14 * r * r), round2(3.14 * r * 2), r * r, round2(3.14 * r)]) };
    },
    // Nivel 4 - Pitagoras + area
    () => {
      const cat1 = randInt(3, 15), cat2 = randInt(3, 15);
      const hip = round2(Math.sqrt(cat1 * cat1 + cat2 * cat2));
      const area = (cat1 * cat2) / 2;
      return { question: `Terreno retang. com diagonais perpendiculares: lados ${cat1}m e ${cat2}m. Hipotenusa e area?`, answer: `Hip=${hip}m, Area=${area}m\u00B2`, options: shuffle([`Hip=${hip}m, Area=${area}m\u00B2`, `Hip=${cat1 + cat2}m, Area=${cat1 * cat2}m\u00B2`, `Hip=${hip}m, Area=${cat1 * cat2}m\u00B2`, `Hip=${area}m, Area=${hip}m\u00B2`]) };
    },
    // Nivel 5 - escada com trigonometria (Consulplan)
    () => {
      const ang1 = 30, ang2 = 60;
      const h = randInt(6, 18);
      const dist = round2(h / Math.tan(ang1 * Math.PI / 180) - h / Math.tan(ang2 * Math.PI / 180));
      return { question: `Escada apoiada no quartel: angulo ${ang1}\u00B0. Bombeiro se aproxima ${dist}m e angulo vira ${ang2}\u00B0. Altura da parede?`, answer: h, options: shuffle([h, h + 2, h - 1, dist]) };
    },
  ],

  // ============================================================
  // GEOMETRIA ESPACIAL
  // ============================================================
  geometria_espacial: [
    () => {
      const l = randInt(3, 15);
      return { question: `Cubo aresta ${l}cm. Volume?`, answer: l ** 3, options: shuffle([l ** 3, l * l * 6, l * 4, l ** 3 + 20]) };
    },
    () => {
      const l = randInt(5, 20), a = randInt(5, 20), h = randInt(5, 20);
      return { question: `Paralelep. ${l}x${a}x${h}m. Volume?`, answer: l * a * h, options: shuffle([l * a * h, (l + a + h) * 2, l * a + a * h + l * h, l * a * h + 100]) };
    },
    () => {
      const r = randInt(3, 15), h = randInt(5, 25);
      return { question: `Cilindro r=${r}m, h=${h}m. Volume? (\u03C0=3,14)`, answer: round2(3.14 * r * r * h), options: shuffle([round2(3.14 * r * r * h), round2(3.14 * r * h), round2(r * r * h), round2(3.14 * r * 2 * h)]) };
    },
    () => {
      const r = randInt(3, 12);
      return { question: `Esfera r=${r}cm. Volume? (\u03C0=3,14)`, answer: round2((4 / 3) * 3.14 * r ** 3), options: shuffle([round2((4 / 3) * 3.14 * r ** 3), round2(3.14 * r ** 3), round2(4 * 3.14 * r ** 3), round2(3.14 * r * r)]) };
    },
    // Nivel 4 - prisma com PG (IME)
    () => {
      const a = randInt(1, 4);
      const l1 = a, l2 = a * 2, l3 = a * 4;
      const areaTotal = 2 * (l1 * l2 + l1 * l3 + l2 * l3);
      return { question: `Prisma retangular: arestas em PG razao 2. 1a aresta=${l1}cm, area total=${areaTotal}cm\u00B2. Diagonal?`, answer: round2(Math.sqrt(l1 * l1 + l2 * l2 + l3 * l3)), options: shuffle([round2(Math.sqrt(l1 * l1 + l2 * l2 + l3 * l3)), round2(l1 + l2 + l3), round2(Math.sqrt(l1 * l2 * l3)), round2(areaTotal / l1)]) };
    },
    // Nivel 5 - cilindro completo
    () => {
      const r = randInt(3, 10), h = randInt(5, 20);
      const aLateral = round2(2 * 3.14 * r * h);
      const aBase = round2(3.14 * r * r);
      const aTotal = aLateral + 2 * aBase;
      const vol = round2(3.14 * r * r * h);
      return { question: `Tanque cilindrico: r=${r}m, h=${h}m. Area lateral, total e volume? (\u03C0=3,14)`, answer: `Al=${aLateral}m\u00B2, At=${aTotal}m\u00B2, V=${vol}m\u00B3`, options: shuffle([`Al=${aLateral}m\u00B2, At=${aTotal}m\u00B2, V=${vol}m\u00B3`, `Al=${aBase}m\u00B2, At=${aTotal}m\u00B2, V=${vol}m\u00B3`, `Al=${aLateral}m\u00B2, At=${aLateral}m\u00B2, V=${vol}m\u00B3`, `Al=${aLateral}m\u00B2, At=${aTotal}m\u00B2, V=${vol + 10}m\u00B3`]) };
    },
  ],

  // ============================================================
  // ESTATISTICA
  // ============================================================
  estatistica: [
    () => {
      const nums = Array.from({ length: 5 }, () => randInt(8, 40));
      const m = round2(nums.reduce((a, b) => a + b, 0) / 5);
      return { question: `Atendimentos: ${nums.join(', ')}. Media?`, answer: m, options: shuffle([m, nums[2], nums.reduce((a, b) => a + b, 0), round2(m + 3)]) };
    },
    () => {
      const nums = Array.from({ length: 5 }, () => randInt(10, 50)).sort((a, b) => a - b);
      return { question: `Tempos: ${nums.join(', ')}. Mediana?`, answer: nums[2], options: shuffle([nums[2], nums[0], nums[4], round2(nums.reduce((a, b) => a + b, 0) / 5)]) };
    },
    () => {
      const nums = Array.from({ length: 7 }, () => randInt(5, 35));
      const m = round2(nums.reduce((a, b) => a + b, 0) / 7);
      return { question: `Acidentes: ${nums.join(', ')}. Media?`, answer: m, options: shuffle([m, nums[3], nums.reduce((a, b) => a + b, 0), round2(m + 5)]) };
    },
    () => {
      const nums = Array.from({ length: 9 }, () => randInt(5, 50)).sort((a, b) => a - b);
      return { question: `Deslocamentos: ${nums.join(', ')}. Mediana?`, answer: nums[4], options: shuffle([nums[4], nums[0], nums[8], round2(nums.reduce((a, b) => a + b, 0) / 9)]) };
    },
    // Nivel 4 - media ponderada
    () => {
      const peso1 = randInt(2, 5), peso2 = randInt(2, 5);
      const media1 = randFloat(5, 10, 1), media2 = randFloat(4, 9, 1);
      const mp = round2((media1 * peso1 + media2 * peso2) / (peso1 + peso2));
      return { question: `Notas: peso ${peso1} com media ${media1} e peso ${peso2} com media ${media2}. Media ponderada?`, answer: mp, options: shuffle([mp, round2((media1 + media2) / 2), round2(media1 * peso1 + media2 * peso2), round2(mp + 1)]) };
    },
    // Nivel 5 - moda + mediana + media
    () => {
      const moda = randInt(10, 30);
      const nums = shuffle([moda, moda, moda, randInt(1, 9), randInt(31, 50), randInt(5, 15), randInt(20, 40)]).sort((a, b) => a - b);
      const media = round2(nums.reduce((a, b) => a + b, 0) / 7);
      return { question: `Tempos: ${nums.join(', ')}. Moda, mediana e media?`, answer: `Moda=${moda}, Med=${nums[3]}, Media=${media}`, options: shuffle([`Moda=${moda}, Med=${nums[3]}, Media=${media}`, `Moda=${nums[3]}, Med=${moda}, Media=${media}`, `Moda=${moda}, Med=${nums[3]}, Media=${media + 2}`, `Moda=${moda}, Med=${nums[0]}, Media=${media}`]) };
    },
  ],

  // ============================================================
  // PROBABILIDADE
  // ============================================================
  probabilidade: [
    () => {
      const total = randInt(8, 20), fav = randInt(1, Math.floor(total / 2));
      const [sn, sd] = simplifyFraction(fav, total);
      return { question: `${total} extint., ${fav} venc. Prob.?`, answer: formatFraction(sn, sd), options: shuffle([formatFraction(sn, sd), formatFraction(total - fav, total), formatFraction(fav + 1, total), formatFraction(1, total)]) };
    },
    () => {
      const total = randInt(6, 15), fav = randInt(1, Math.floor(total / 2));
      const [sn, sd] = simplifyFraction(fav, total);
      return { question: `${total} viat., ${fav} manut. Prob.?`, answer: formatFraction(sn, sd), options: shuffle([formatFraction(sn, sd), formatFraction(total - fav, total), formatFraction(fav, total - fav), formatFraction(1, total)]) };
    },
    () => {
      const fav = randInt(1, 6);
      const [sn, sd] = simplifyFraction(fav, 6);
      return { question: `Dado. Prob. ${fav <= 3 ? 'par' : '>3'}?`, answer: formatFraction(sn, sd), options: shuffle([formatFraction(sn, sd), formatFraction(6 - fav, 6), formatFraction(fav + 1, 6), formatFraction(1, 6)]) };
    },
    () => {
      const total = randInt(20, 60), fav = randInt(5, Math.floor(total / 2));
      return { question: `${total} cand., ${fav} aprov. mat. Taxa?`, answer: round2((fav / total) * 100), options: shuffle([round2((fav / total) * 100), round2(((total - fav) / total) * 100), round2((fav / total) * 100 + 10), round2(100 - (fav / total) * 100)]) };
    },
    // Nivel 4 - combinacao simples
    () => {
      const total = randInt(6, 12), escolhidos = randInt(2, 4);
      const fav = comb(total, escolhidos);
      const [sn, sd] = simplifyFraction(1, fav);
      return { question: `De ${total} equipamentos, ${escolhidos} sao selecionados. Prob. de um conjunto especifico?`, answer: formatFraction(sn, sd), options: shuffle([formatFraction(sn, sd), formatFraction(escolhidos, total), formatFraction(1, total), formatFraction(escolhidos, fav)]) };
    },
    // Nivel 5 - inspirado em CESPE: pelo menos 1 mulher
    () => {
      const totalMasc = randInt(5, 9), totalFem = randInt(3, 6);
      const total = totalMasc + totalFem;
      const totalComb = comb(total, 2);
      const semMulheres = comb(totalMasc, 2);
      const comPeloMenos1Mulher = totalComb - semMulheres;
      const [sn, sd] = simplifyFraction(comPeloMenos1Mulher, totalComb);
      return { question: `${total} militares (${totalMasc}H, ${totalFem}M). 2 escolhidos ao acaso. Prob. pelo menos 1 mulher?`, answer: formatFraction(sn, sd), options: shuffle([formatFraction(sn, sd), formatFraction(totalFem, total), formatFraction(comb(totalFem, 1) * comb(totalMasc, 1), totalComb), formatFraction(semMulheres, totalComb)]) };
    },
  ],

  // ============================================================
  // RACIOCINIO LOGICO
  // ============================================================
  raciocinio_logico: [
    () => {
      const a = randInt(2, 5), s = randInt(1, 10);
      const seq = Array.from({ length: 4 }, (_, i) => s + a * i);
      return { question: `Seq: ${seq.join(', ')}, ?`, answer: s + a * 4, options: shuffle([s + a * 4, s + a * 4 + a, s + a * 4 - 1, seq[3] + 1]) };
    },
    () => {
      const a = randInt(2, 4), s = randInt(1, 5);
      const seq = Array.from({ length: 4 }, (_, i) => s * a ** i);
      return { question: `Proximo: ${seq.join(', ')}, ?`, answer: s * a ** 4, options: shuffle([s * a ** 4, s * a ** 4 + s, seq[3] * a + 1, seq[3] * a - 1]) };
    },
    () => {
      const n = randInt(10, 30);
      return { question: `Soma 1 a ${n}?`, answer: (n * (n + 1)) / 2, options: shuffle([(n * (n + 1)) / 2, n * n, (n * (n + 1)) / 2 + n, (n * (n - 1)) / 2]) };
    },
    () => {
      const base = randInt(2, 6), exp = randInt(3, 5);
      return { question: `${base}^${exp} = ?`, answer: base ** exp, options: shuffle([base ** exp, base * exp, base ** exp + 10, exp ** base]) };
    },
    // Nivel 4
    () => {
      const n = randInt(8, 20);
      return { question: `${n} bmb cumprimentam todos (uma vez cada). Total?`, answer: (n * (n - 1)) / 2, options: shuffle([(n * (n - 1)) / 2, n * n, (n * (n + 1)) / 2, (n * (n - 1)) / 2 + n]) };
    },
    // Nivel 5 - PA/PG
    () => {
      const a1 = randInt(1, 5), r = randInt(2, 4);
      const termos = [a1, a1 * r, a1 * r * r, a1 * r * r * r, a1 * r * r * r * r];
      const soma = termos.reduce((a, b) => a + b, 0);
      return { question: `CBMBA: ${termos[0]} extint. no 1o dia, ${termos[1]} no 2o, PG razao ${r}. Total em 5 dias?`, answer: soma, options: shuffle([soma, termos[4], soma + a1, termos[0] * 5]) };
    },
  ],

  // ============================================================
  // POTENCIACAO E RADICIACAO
  // ============================================================
  potenciacao: [
    () => {
      const base = randInt(2, 9), exp = randInt(2, 4);
      return { question: `${base} elevado a ${exp} = ?`, answer: base ** exp, options: shuffle([base ** exp, base * exp, base ** (exp - 1), base ** exp + base]) };
    },
    () => {
      const r = pick([4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144]);
      return { question: `Raiz quadrada de ${r} = ?`, answer: Math.sqrt(r), options: shuffle([Math.sqrt(r), r / 2, Math.sqrt(r) + 1, r - 10]) };
    },
    () => {
      const a = randInt(2, 5), b = randInt(2, 4);
      const resultado = a ** b;
      return { question: `Calcule: ${a}^${b} + ${randInt(1, 10)}`, answer: resultado + randInt(1, 10), options: shuffle([resultado + randInt(1, 10), resultado, a * b + randInt(1, 10), resultado + 20]) };
    },
    () => {
      const base = randInt(2, 6), e1 = randInt(2, 3), e2 = randInt(2, 3);
      const r = base ** (e1 + e2);
      return { question: `${base}^${e1} x ${base}^${e2} = ?`, answer: r, options: shuffle([r, base ** e1 + base ** e2, base * (e1 + e2), r + base]) };
    },
    () => {
      const b = randInt(2, 5);
      const r = Math.round(Math.sqrt(b ** 6));
      return { question: `Raiz cubica de ${b ** 6} = ?`, answer: b ** 2, options: shuffle([b ** 2, b ** 3, b, b ** 4]) };
    },
  ],

  // ============================================================
  // MMC E MDC
  // ============================================================
  mmc_mdc: [
    () => {
      const a = randInt(4, 12), b = randInt(4, 12);
      return { question: `MDC de ${a} e ${b} = ?`, answer: gcd(a, b), options: shuffle([gcd(a, b), a * b, Math.min(a, b), gcd(a, b) + 1]) };
    },
    () => {
      const a = pick([4, 6, 8, 9, 10, 12]), b = pick([6, 8, 10, 12, 15, 18]);
      const mmc = (a * b) / gcd(a, b);
      return { question: `MMC de ${a} e ${b} = ?`, answer: mmc, options: shuffle([mmc, a * b, Math.max(a, b), mmc - a]) };
    },
    () => {
      const a = randInt(6, 18), b = randInt(6, 18), c = randInt(6, 18);
      const mdc1 = gcd(a, b);
      const mdc2 = gcd(mdc1, c);
      return { question: `MDC de ${a}, ${b} e ${c} = ?`, answer: mdc2, options: shuffle([mdc2, gcd(a, b), Math.min(a, b, c), mdc2 + 1]) };
    },
    () => {
      const n1 = randInt(4, 10), n2 = randInt(4, 10);
      const mmc = (n1 * n2) / gcd(n1, n2);
      return { question: `${pick(NOMES)} quer agrupar ${n1} garrafas e ${n2} copes em pacotes iguais. Min. garrafas por pacote?`, answer: mmc, options: shuffle([mmc, n1 * n2, Math.min(n1, n2), gcd(n1, n2)]) };
    },
    () => {
      const a = pick([6, 8, 10, 12]), b = pick([8, 10, 12, 15]);
      const mdc = gcd(a, b);
      const mmc = (a * b) / mdc;
      return { question: `MMC de ${a} e ${b} e MDC de ${a} e ${b}. Soma?`, answer: mmc + mdc, options: shuffle([mmc + mdc, mmc * mdc, mmc - mdc, mmc + mdc + 2]) };
    },
  ],

  // ============================================================
  // EQUACOES DO 2o GRAU
  // ============================================================
  equacoes_2grau: [
    () => {
      const r1 = randInt(-8, 8), r2 = randInt(-8, 8);
      const b = -(r1 + r2), c = r1 * r2;
      return { question: `x² + (${b})x + (${c}) = 0. Um valor de x?`, answer: r1, options: shuffle([r1, r2, r1 + 1, r2 - 1]) };
    },
    () => {
      const a = 1, b = randInt(-10, 10), c = randInt(-10, 10);
      const disc = b * b - 4 * a * c;
      if (disc < 0) return topicGenerators.equacoes_2grau[0]();
      const sqrtDisc = Math.sqrt(disc);
      const x1 = (-b + sqrtDisc) / (2 * a);
      const x2 = (-b - sqrtDisc) / (2 * a);
      if (!Number.isInteger(x1) || !Number.isInteger(x2)) return topicGenerators.equacoes_2grau[0]();
      return { question: `x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0. Disc. = ?`, answer: disc, options: shuffle([disc, disc + 4, b * b, disc - 4 * c]) };
    },
    () => {
      const r1 = randInt(1, 10), r2 = randInt(1, 10);
      const soma = r1 + r2, prod = r1 * r2;
      return { question: `Eq. com raizes ${r1} e ${r2}. Soma das raizes?`, answer: soma, options: shuffle([soma, prod, soma + 1, r1 * 2]) };
    },
    () => {
      const r1 = randInt(2, 8), r2 = randInt(2, 8);
      const soma = r1 + r2, prod = r1 * r2;
      return { question: `x² - ${soma}x + ${prod} = 0. Produto das raizes?`, answer: prod, options: shuffle([prod, soma, prod + 2, soma * 2]) };
    },
    () => {
      const a = randInt(1, 3), b = randInt(-8, 8), c = randInt(-8, 8);
      const disc = b * b - 4 * a * c;
      if (disc < 0) return topicGenerators.equacoes_2grau[2]();
      const sqrtDisc = Math.sqrt(disc);
      if (!Number.isInteger(sqrtDisc)) return topicGenerators.equacoes_2grau[2]();
      const x1 = (-b + sqrtDisc) / (2 * a);
      if (!Number.isInteger(x1)) return topicGenerators.equacoes_2grau[2]();
      return { question: `${a}x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0. x = ?`, answer: x1, options: shuffle([x1, x1 + 1, x1 - 1, -x1]) };
    },
  ],

  // ============================================================
  // PROGRESSAO ARITMETICA E GEOMETRICA
  // ============================================================
  pa_pg: [
    () => {
      const a1 = randInt(2, 10), r = randInt(1, 5), n = randInt(3, 8);
      const an = a1 + (n - 1) * r;
      return { question: `PA: a1=${a1}, r=${r}. ${n}o termo?`, answer: an, options: shuffle([an, a1 + n * r, a1 * r, an + r]) };
    },
    () => {
      const a1 = randInt(2, 10), r = randInt(1, 5), n = randInt(3, 6);
      const soma = (n * (2 * a1 + (n - 1) * r)) / 2;
      return { question: `PA: a1=${a1}, r=${r}. Soma dos ${n} primeiros?`, answer: soma, options: shuffle([soma, n * a1, soma + a1, n * (a1 + r)]) };
    },
    () => {
      const a1 = randInt(1, 5), r = randInt(2, 4), n = randInt(3, 5);
      const an = a1 * r ** (n - 1);
      return { question: `PG: a1=${a1}, q=${r}. ${n}o termo?`, answer: an, options: shuffle([an, a1 * r * n, a1 + (n - 1) * r, an + a1]) };
    },
    () => {
      const a1 = randInt(1, 4), r = randInt(2, 3), n = randInt(3, 5);
      const soma = a1 * (r ** n - 1) / (r - 1);
      return { question: `PG: a1=${a1}, q=${r}. Soma dos ${n} primeiros?`, answer: soma, options: shuffle([soma, n * a1, a1 * r ** n, soma + a1]) };
    },
    () => {
      const a1 = randInt(3, 8), r = randInt(2, 4), n = 5;
      const an = a1 * r ** (n - 1);
      const soma = a1 * (r ** n - 1) / (r - 1);
      return { question: `CBMBA: ${a1} militares no 1o dia, cada dia triplica. No 5o dia e total?`, answer: `${an} e ${soma}`, options: shuffle([`${an} e ${soma}`, `${an} e ${an * 2}`, `${a1 * n} e ${soma}`, `${an} e ${soma + a1}`]) };
    },
  ],

  // ============================================================
  // LOGARITMOS
  // ============================================================
  logaritmos: [
    () => {
      const base = pick([2, 3, 5, 10]);
      const exp = randInt(1, 4);
      return { question: `log_${base}(${base ** exp}) = ?`, answer: exp, options: shuffle([exp, base ** exp, exp + 1, base]) };
    },
    () => {
      const a = pick([2, 3, 5]), b = pick([2, 3, 5]);
      const r = Math.round(Math.log(a * b) / Math.log(10) * 100) / 100;
      return { question: `log(${a}) + log(${b}) = log(x). x = ?`, answer: a * b, options: shuffle([a * b, a + b, a * b + 1, a ** b]) };
    },
    () => {
      const base = pick([2, 3, 5, 10]);
      const a = randInt(1, 4), b = randInt(1, 4);
      return { question: `log_${base}(${base ** a}) - log_${base}(${base ** b}) = ?`, answer: a - b, options: shuffle([a - b, a + b, a * b, base ** (a - b)]) };
    },
    () => {
      const base = pick([2, 3]);
      const exp = randInt(2, 4);
      return { question: `log_${base}(${base ** exp}) = ?`, answer: exp, options: shuffle([exp, base ** exp, exp * base, exp - 1]) };
    },
    () => {
      const base = pick([2, 3, 5]);
      const a = randInt(2, 4), b = randInt(2, 4);
      const prod = a * b;
      return { question: `log_${base}(${base ** a} x ${base ** b}) = ?`, answer: prod, options: shuffle([prod, a + b, a * b + 1, base ** prod]) };
    },
  ],

  // ============================================================
  // ANGULOS E TEOREMA DE TALES
  // ============================================================
  angulos_tales: [
    () => {
      const a = randInt(20, 80);
      return { question: `Dois angulos sao complementares. Um mede ${a}°. Qual o outro?`, answer: 90 - a, options: shuffle([90 - a, 180 - a, a + 90, a - 10]) };
    },
    () => {
      const a = randInt(30, 150);
      return { question: `Dois angulos sao suplementares. Um mede ${a}°. Qual o outro?`, answer: 180 - a, options: shuffle([180 - a, 90 - a, 360 - a, a + 90]) };
    },
    () => {
      const a = randInt(20, 80);
      return { question: `Angulo a = ${a}°. Angulo oposto pelo vertice = ?`, answer: a, options: shuffle([a, 90 - a, 180 - a, a + 10]) };
    },
    () => {
      const ab = randInt(3, 10), bc = randInt(2, 8), de = randInt(2, 10);
      const r = (de * ab) / bc;
      return { question: `Tales: AB/BC = DE/EF. AB=${ab}, BC=${bc}, DE=${de}. EF = ?`, answer: round2(r), options: shuffle([round2(r), round2(de * bc / ab), de + ab, round2(r + 1)]) };
    },
    () => {
      const base = randInt(6, 20), h = randInt(4, 15);
      const area = (base * h) / 2;
      return { question: `Triangulo: base=${base}cm, altura=${h}cm. Area = ?`, answer: area, options: shuffle([area, base * h, base + h, (base + h) * 2]) };
    },
  ],

  // ============================================================
  // VALORES ABSOLUTOS
  // ============================================================
  valores_absolutos: [
    () => {
      const n = randInt(-20, -1);
      return { question: `|${n}| = ?`, answer: Math.abs(n), options: shuffle([Math.abs(n), n, n - 1, Math.abs(n) + 1]) };
    },
    () => {
      const n = randInt(1, 20);
      return { question: `|x| = ${n}. Quantas solucoes?`, answer: 2, options: shuffle([2, 1, n, 0]) };
    },
    () => {
      const n = randInt(1, 15);
      return { question: `|x - 3| = ${n}. x = ?`, answer: n + 3, options: shuffle([n + 3, n - 3, n, 3 - n]) };
    },
    () => {
      const a = randInt(1, 10), b = randInt(1, 10);
      return { question: `|${a}| + |${-b}| = ?`, answer: a + b, options: shuffle([a + b, a - b, Math.abs(a - b), a + b + 1]) };
    },
    () => {
      const n = randInt(2, 10);
      return { question: `|2x - 4| = ${n}. x = ?`, answer: (n + 4) / 2, options: shuffle([(n + 4) / 2, (n - 4) / 2, n + 2, n - 2]) };
    },
  ],

  // ============================================================
  // TRIGONOMETRIA
  // ============================================================
  trigonometria: [
    () => {
      const a = pick([30, 45, 60]);
      const sen = { 30: '1/2', 45: 'V2/2', 60: 'V3/2' };
      return { question: `sen(${a}\u00B0) = ?`, answer: sen[a], options: shuffle([sen[a], '0', '1', '-1']) };
    },
    () => {
      const a = pick([30, 45, 60]);
      const cos = { 30: 'V3/2', 45: 'V2/2', 60: '1/2' };
      return { question: `cos(${a}\u00B0) = ?`, answer: cos[a], options: shuffle([cos[a], '0', '1', '-1']) };
    },
    () => {
      const a = pick([30, 45, 60]);
      const tan = { 30: 'V3/3', 45: '1', 60: 'V3' };
      return { question: `tan(${a}\u00B0) = ?`, answer: tan[a], options: shuffle([tan[a], '0', 'V3/2', '-1']) };
    },
    () => {
      const hip = randInt(5, 15), cat1 = randInt(3, hip - 1);
      const cat2 = round2(Math.sqrt(hip * hip - cat1 * cat1));
      return { question: `Triangulo ret. hip=${hip}, cateto=${cat1}. Outro cateto?`, answer: cat2, options: shuffle([cat2, hip + cat1, hip - cat1, cat1 + 2]) };
    },
    () => {
      const cat1 = randInt(3, 12), cat2 = randInt(3, 12);
      const hip = round2(Math.sqrt(cat1 * cat1 + cat2 * cat2));
      return { question: `Catetos ${cat1} e ${cat2}. Hipotenusa?`, answer: hip, options: shuffle([hip, cat1 + cat2, cat1 * cat2, hip + 1]) };
    },
  ],

  // ============================================================
  // ANALISE COMBINATORIA
  // ============================================================
  analise_combinatoria: [
    () => {
      const n = randInt(3, 8);
      let fat = 1; for (let i = 2; i <= n; i++) fat *= i;
      return { question: `${n}! = ?`, answer: fat, options: shuffle([fat, fat * n, n * (n - 1), fat + n]) };
    },
    () => {
      const n = randInt(4, 8), k = randInt(2, Math.min(4, n));
      const r = comb(n, k);
      return { question: `C(${n}, ${k}) = ?`, answer: r, options: shuffle([r, comb(n, n - k), n * k, r + 1]) };
    },
    () => {
      const n = randInt(3, 6);
      let fat = 1; for (let i = 2; i <= n; i++) fat *= i;
      const r = fat;
      return { question: `${n} bombeiros em fileira. Permutacoes?`, answer: r, options: shuffle([r, n * (n - 1), r + n, n ** n]) };
    },
    () => {
      const n = randInt(4, 8), k = randInt(2, Math.min(4, n));
      let fatN = 1; for (let i = 2; i <= n; i++) fatN *= i;
      let fatNk = 1; for (let i = 2; i <= n - k; i++) fatNk *= i;
      const r = fatN / fatNk;
      return { question: `A(${n}, ${k}) = ?`, answer: r, options: shuffle([r, comb(n, k), n ** k, r - k]) };
    },
    () => {
      const n = randInt(5, 10), k = randInt(2, 4);
      const r = comb(n, k);
      return { question: `De ${n} soldados, ${k} formam equipe. Modos?`, answer: r, options: shuffle([r, comb(n, n - k), n * k, r + n]) };
    },
  ],

  // ============================================================
  // CONJUNTOS NUMERICOS
  // ============================================================
  conjuntos: [
    () => {
      return { question: `N \u2282 ?`, answer: 'Z', options: shuffle(['Z', 'Q', 'R', 'C']) };
    },
    () => {
      return { question: `Z \u2282 ?`, answer: 'Q', options: shuffle(['Q', 'N', 'R', 'C']) };
    },
    () => {
      return { question: `Q \u2282 ?`, answer: 'R', options: shuffle(['R', 'N', 'Z', 'C']) };
    },
    () => {
      const a = randInt(1, 10), b = randInt(1, 10), c = randInt(1, 10);
      return { question: `{${a}, ${b}, ${c}} \u222A {${b}, ${c}, ${a + 5}} = ?`, answer: `{${a}, ${b}, ${c}, ${a + 5}}`, options: shuffle([`{${a}, ${b}, ${c}, ${a + 5}}`, `{${a}, ${b}, ${c}}`, `{${b}, ${c}, ${a + 5}}`, `{${a}, ${c}}`]) };
    },
    () => {
      const n = randInt(3, 6);
      const A = Array.from({ length: n }, () => randInt(1, 15));
      const B = Array.from({ length: n }, () => randInt(1, 15));
      const intersec = A.filter(x => B.includes(x));
      return { question: `{${A.join(', ')}} \u2229 {${B.join(', ')}} tem quantos elementos?`, answer: intersec.length, options: shuffle([intersec.length, n, n + 1, n - 1]) };
    },
  ],

  // ============================================================
  // MATRIZES E SISTEMAS LINEARES
  // ============================================================
  matrizes: [
    () => {
      const a = randInt(1, 9), b = randInt(1, 9);
      return { question: `Matriz 1x1: [${a}] + [${b}] = ?`, answer: `[${a + b}]`, options: shuffle([`[${a + b}]`, `[${a * b}]`, `[${a - b}]`, `[${a + b + 1}]`]) };
    },
    () => {
      const a = randInt(1, 5), b = randInt(1, 5), k = randInt(2, 5);
      return { question: `k x [${a}, ${b}] com k=${k}. Resultado?`, answer: `[${a * k}, ${b * k}]`, options: shuffle([`[${a * k}, ${b * k}]`, `[${a + k}, ${b + k}]`, `[${a * k}, ${b}]`, `[${a}, ${b * k}]`]) };
    },
    () => {
      const a = randInt(2, 6), b = randInt(2, 6);
      return { question: `Det([[${a}, 0], [0, ${b}]]) = ?`, answer: a * b, options: shuffle([a * b, a + b, a - b, a * b + 1]) };
    },
    () => {
      const x = randInt(1, 8), y = randInt(1, 8);
      const a1 = randInt(1, 3), b1 = randInt(1, 3), c1 = a1 * x + b1 * y;
      const a2 = randInt(1, 3), b2 = randInt(1, 3), c2 = a2 * x + b2 * y;
      if (a1 * b2 === a2 * b1) return topicGenerators.matrizes[3]();
      return { question: `Sistema: ${a1}x+${b1}y=${c1} e ${a2}x+${b2}y=${c2}. x+y=?`, answer: x + y, options: shuffle([x + y, x - y, x * y, x + y + 1]) };
    },
    () => {
      const a = randInt(1, 5), b = randInt(1, 5), c = randInt(1, 5), d = randInt(1, 5);
      const det = a * d - b * c;
      return { question: `Det([[${a}, ${b}], [${c}, ${d}]]) = ?`, answer: det, options: shuffle([det, a * d + b * c, a + d - b - c, det + 1]) };
    },
  ],

  // ============================================================
  // GEOMETRIA ANALITICA
  // ============================================================
  geometria_analitica: [
    () => {
      const x1 = randInt(0, 10), y1 = randInt(0, 10), x2 = randInt(0, 10), y2 = randInt(0, 10);
      const dist = round2(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2));
      return { question: `Distancia entre (${x1},${y1}) e (${x2},${y2}) = ?`, answer: dist, options: shuffle([dist, (x2 - x1) + (y2 - y1), Math.abs(x2 - x1) + Math.abs(y2 - y1), dist + 1]) };
    },
    () => {
      const x = randInt(1, 10), y = randInt(1, 10);
      const dist = round2(Math.sqrt(x * x + y * y));
      return { question: `Distancia de (${x},${y}) a origem = ?`, answer: dist, options: shuffle([dist, x + y, Math.abs(x) + Math.abs(y), x * y]) };
    },
    () => {
      const x1 = randInt(0, 8), y1 = randInt(0, 8), x2 = randInt(0, 8), y2 = randInt(0, 8);
      const mx = round2((x1 + x2) / 2), my = round2((y1 + y2) / 2);
      return { question: `Ponto medio de (${x1},${y1}) e (${x2},${y2}) = ?`, answer: `(${mx}, ${my})`, options: shuffle([`(${mx}, ${my})`, `(${x1 + x2}, ${y1 + y2})`, `(${mx + 1}, ${my})`, `(${mx}, ${my + 1})`]) };
    },
    () => {
      const a = randInt(1, 8), b = randInt(1, 8);
      return { question: `Ponto (${a}, ${b}) na reta y=x+0?`, answer: a === b ? 'Sim' : 'Nao', options: shuffle([a === b ? 'Sim' : 'Nao', 'Sempre', 'Nunca', 'Depende']) };
    },
    () => {
      const x1 = randInt(1, 8), y1 = randInt(1, 8), x2 = randInt(1, 8), y2 = randInt(1, 8);
      if (x1 === x2) return topicGenerators.geometria_analitica[0]();
      const m = round2((y2 - y1) / (x2 - x1));
      return { question: `Inclinacao da reta por (${x1},${y1}) e (${x2},${y2}) = ?`, answer: m, options: shuffle([m, round2((x2 - x1) / (y2 - y1)), m + 1, -m]) };
    },
  ],

  // ============================================================
  // POLINOMIOS
  // ============================================================
  polinomios: [
    () => {
      const a = randInt(1, 5), b = randInt(1, 10);
      return { question: `P(x) = ${a}x + ${b}. P(0) = ?`, answer: b, options: shuffle([b, a, a + b, b + 1]) };
    },
    () => {
      const a = randInt(1, 5), b = randInt(-5, 5), x = randInt(1, 5);
      const px = a * x + b;
      return { question: `P(x) = ${a}x ${b >= 0 ? '+' : ''}${b}. P(${x}) = ?`, answer: px, options: shuffle([px, a * x, px + 1, a * (x + 1) + b]) };
    },
    () => {
      const r = randInt(-5, 5), q = randInt(1, 5);
      return { question: `(x - ${r}) \u00D7 (x + ${q}) = ? (termo de x)`, answer: q - r, options: shuffle([q - r, q + r, q * r, -q * r]) };
    },
    () => {
      const a = randInt(1, 5), r = randInt(1, 5);
      const px = `x\u00B2 - ${a + r}x + ${a * r}`;
      return { question: `P(x) = ${px}. Raizes?`, answer: `${a} e ${r}`, options: shuffle([`${a} e ${r}`, `${a + 1} e ${r}`, `${a} e ${r + 1}`, `${a * r} e ${a + r}`]) };
    },
    () => {
      const a = randInt(2, 5), b = randInt(1, 5);
      const valor = a ** 3 + b;
      return { question: `P(x) = x\u00B2 + ${b}. P(x) dividido por (x - ${a}), resto = ?`, answer: a * a + b, options: shuffle([a * a + b, a + b, a * a - b, b]) };
    },
  ],

  // ============================================================
  // NUMEROS COMPLEXOS
  // ============================================================
  numeros_complexos: [
    () => {
      return { question: `i\u00B2 = ?`, answer: '-1', options: shuffle(['-1', '1', 'i', '-i']) };
    },
    () => {
      const a = randInt(1, 10), b = randInt(1, 10);
      return { question: `(${a} + ${b}i) + (${a} - ${b}i) = ?`, answer: 2 * a, options: shuffle([2 * a, 0, 2 * b, a + b]) };
    },
    () => {
      const a = randInt(1, 5), b = randInt(1, 5);
      return { question: `|${a} + ${b}i| = ?`, answer: round2(Math.sqrt(a * a + b * b)), options: shuffle([round2(Math.sqrt(a * a + b * b)), a + b, a * b, round2(Math.sqrt(a + b))]) };
    },
    () => {
      const a = randInt(2, 6);
      return { question: `(3 + 2i)(3 - 2i) = ?`, answer: 13, options: shuffle([13, 5, 9, 6]) };
    },
    () => {
      const a = randInt(1, 5), b = randInt(1, 5), c = randInt(1, 5), d = randInt(1, 5);
      const real = a * c - b * d;
      return { question: `Parte real de (${a}+${b}i)(${c}+${d}i) = ?`, answer: real, options: shuffle([real, a * c + b * d, a * d + b * c, real + 1]) };
    },
  ],

  // ============================================================
  // JUROS SIMPLES
  // ============================================================
  juros_simples: [
    withTemplates(
      () => {
        const C = randInt(1000, 20000);
        const i = pick([1, 2, 3, 4, 5, 6, 8, 10]);
        const t = pick([1, 2, 3, 4, 6, 12]);
        const J = round2(C * (i / 100) * t);
        return { question: `Capital de ${formatCurrency(C)} aplicado a ${i}% a.m. por ${t} mes(es). Juros simples?`, answer: J, options: shuffle([J, round2(C * (i / 100)), round2(C * i * t), round2(C + J)]) };
      },
      () => {
        const C = randInt(2000, 30000);
        const i = pick([1, 1.5, 2, 2.5, 3]);
        const t = pick([3, 6, 9, 12]);
        const J = round2(C * (i / 100) * t);
        return { question: `${pick(NOMES_MASC)} aplicou ${formatCurrency(C)} a ${i}% ao mes por ${t} meses. Quanto rendeu em juros?`, answer: J, options: shuffle([J, round2(C * (i / 100)), round2(C + J), round2(C * i * t)]) };
      },
    ),
    withTemplates(
      () => {
        const C = randInt(5000, 50000);
        const i = pick([1, 2, 3, 5]);
        const t = pick([2, 4, 6, 8]);
        const J = round2(C * (i / 100) * t);
        const M = C + J;
        return { question: `Aplicacao de ${formatCurrency(C)} a ${i}% a.m. por ${t} meses (juros simples). Montante?`, answer: M, options: shuffle([M, C, J, round2(C * (1 + i / 100))]) };
      },
      () => {
        const C = randInt(3000, 40000);
        const i = pick([2, 3, 5]);
        const t = pick([3, 6, 12]);
        const J = round2(C * (i / 100) * t);
        return { question: `Um investimento de ${formatCurrency(C)} rendeu ${formatCurrency(J)} em juros simples. Taxa: ${i}% a.m. Em quanto tempo?`, answer: t, options: shuffle([t, t + 2, t - 1, round2(J / C * 100)]) };
      },
    ),
    withTemplates(
      () => {
        const C = randInt(5000, 30000);
        const t = pick([3, 6, 12]);
        const i = pick([1, 2, 3, 5]);
        const J = round2(C * (i / 100) * t);
        return { question: `Aplicacao de ${formatCurrency(C)} por ${t} meses (juros simples) rendeu ${formatCurrency(J)}. Qual a taxa mensal?`, answer: i, options: shuffle([i, i + 1, i - 0.5, round2(J / C * 100 / t)]) };
      },
      () => {
        const M = randInt(10000, 80000);
        const i = pick([1, 2, 3, 5]);
        const t = pick([2, 4, 6, 12]);
        const C = round2(M / (1 + (i / 100) * t));
        return { question: `O montante foi ${formatCurrency(M)} apos ${t} meses a ${i}% a.m. (juros simples). Capital inicial?`, answer: C, options: shuffle([C, round2(M * (1 - i / 100)), M - randInt(500, 2000), round2(M / (1 + i * t))]) };
      },
    ),
    withTemplates(
      () => {
        const C1 = randInt(5000, 20000), i1 = pick([1, 2, 3]), t1 = pick([3, 6]);
        const C2 = randInt(5000, 20000), i2 = pick([1, 2, 3]), t2 = pick([3, 6]);
        const J1 = C1 * (i1 / 100) * t1;
        const J2 = C2 * (i2 / 100) * t2;
        const melhor = J1 > J2 ? 'Primeiro' : 'Segundo';
        return { question: `Inv. A: ${formatCurrency(C1)} a ${i1}%/${t1}m. Inv. B: ${formatCurrency(C2)} a ${i2}%/${t2}m. Qual rende mais?`, answer: melhor, options: shuffle([melhor, 'Ambos igual', melhor === 'Primeiro' ? 'Segundo' : 'Primeiro', 'Nao da pra saber']) };
      },
      () => {
        const C = randInt(5000, 30000);
        const i = pick([1, 2, 3]);
        const t1 = pick([3, 6]), t2 = t1 + pick([3, 6]);
        const J1 = round2(C * (i / 100) * t1);
        const J2 = round2(C * (i / 100) * t2);
        const diff = J2 - J1;
        return { question: `${formatCurrency(C)} a ${i}% a.m. Qual a diferenca de juros entre ${t2} e ${t1} meses?`, answer: diff, options: shuffle([diff, J2, J1, diff + 100]) };
      },
    ),
    withTemplates(
      () => {
        const C = randInt(10000, 50000);
        const i = pick([1, 2, 3]);
        const J = randInt(1000, 10000);
        const t = round2(J / (C * (i / 100)));
        return { question: `Para render ${formatCurrency(J)} em juros simples a ${i}% a.m., quanto tempo ${formatCurrency(C)} deve ficar aplicado?`, answer: t, options: shuffle([t, t + 2, t - 1, round2(J / C)]) };
      },
      () => {
        const M = randInt(15000, 100000);
        const t = pick([6, 12, 24]);
        const i = pick([1, 2, 3]);
        const C = round2(M / (1 + (i / 100) * t));
        return { question: `${pick(NOMES_MASC)} quer ter ${formatCurrency(M)} em ${t} meses a ${i}% a.m. (juros simples). Quanto aplicar hoje?`, answer: C, options: shuffle([C, M, round2(M * 0.9), round2(M - M * i / 100 * t)]) };
      },
    ),
  ],

  // ============================================================
  // JUROS COMPOSTOS
  // ============================================================
  juros_compostos: [
    withTemplates(
      () => {
        const C = randInt(1000, 15000);
        const i = pick([1, 2, 3, 5]);
        const t = pick([3, 6, 12]);
        const M = round2(C * (1 + i / 100) ** t);
        return { question: `Capital de ${formatCurrency(C)} aplicado a ${i}% a.m. por ${t} meses (juros compostos). Montante?`, answer: M, options: shuffle([M, round2(C + C * (i / 100) * t), round2(C * (1 + i / 100)), round2(M + 50)]) };
      },
      () => {
        const C = randInt(5000, 30000);
        const i = pick([0.5, 1, 1.5, 2]);
        const t = pick([6, 12, 24]);
        const M = round2(C * (1 + i / 100) ** t);
        return { question: `${pick(NOMES_MASC)} investiu ${formatCurrency(C)} a ${i}% ao mes por ${t} meses com juros compostos. Montante?`, answer: M, options: shuffle([M, round2(C * (1 + i / 100) * t), C + round2(C * (i / 100) * t), round2(M - 100)]) };
      },
    ),
    withTemplates(
      () => {
        const C = randInt(5000, 40000);
        const i = pick([1, 2, 3, 5]);
        const t = pick([3, 6, 12]);
        const M = round2(C * (1 + i / 100) ** t);
        const J = M - C;
        return { question: `Aplicacao de ${formatCurrency(C)} a ${i}% a.m. por ${t} meses (compostos). Rendimento total?`, answer: J, options: shuffle([J, M, round2(C * (i / 100) * t), J + 100]) };
      },
      () => {
        const M = randInt(10000, 80000);
        const i = pick([1, 2, 3, 5]);
        const t = pick([3, 6, 12]);
        const C = round2(M / (1 + i / 100) ** t);
        return { question: `Quanto aplicar a ${i}% a.m. por ${t} meses (compostos) para ter ${formatCurrency(M)}?`, answer: C, options: shuffle([C, round2(M * (1 - i / 100)), M - randInt(500, 3000), round2(M / (1 + i * t))]) };
      },
    ),
    withTemplates(
      () => {
        const Cs = randInt(5000, 20000), is = pick([1, 2, 3]);
        const t = pick([6, 12, 24]);
        const Ms = round2(Cs * (1 + is / 100) ** t);
        const Cc = randInt(5000, 20000), ic = pick([1, 2, 3]);
        const Mc = round2(Cc * (1 + ic / 100) ** t);
        const melhor = Ms > Mc ? 'Simples' : 'Compostos';
        return { question: `Simples: ${formatCurrency(Cs)} a ${is}% a.m. Compostos: ${formatCurrency(Cc)} a ${ic}% a.m., ambos ${t}m. Qual rende mais?`, answer: melhor, options: shuffle([melhor, 'Ambos igual', melhor === 'Simples' ? 'Compostos' : 'Simples', 'Nao da pra saber']) };
      },
      () => {
        const C = randInt(10000, 50000);
        const i = pick([1, 2, 3]);
        const Jsimples = round2(C * (i / 100) * 12);
        const Jcompostos = round2(C * ((1 + i / 100) ** 12 - 1));
        const diff = Jcompostos - Jsimples;
        return { question: `${formatCurrency(C)} a ${i}% a.m. por 12 meses. Diferenca entre juros compostos e simples?`, answer: diff, options: shuffle([diff, Jsimples, Jcompostos, diff + 50]) };
      },
    ),
    withTemplates(
      () => {
        const C = randInt(5000, 30000);
        const M = Math.round(C * (1 + 0.02) ** 6);
        const i = 2;
        const t = 6;
        return { question: `Um investimento dobrou em ${t} meses a ${i}% a.m. (compostos). Isso e possivel? (M=${formatCurrency(M)})`, answer: 'Sim', options: shuffle(['Sim', 'Nao', 'Apenas com juros simples', 'Depende do capital']) };
      },
      () => {
        const C = randInt(10000, 50000);
        const i = pick([1, 2, 3, 5]);
        const meses = pick([6, 12, 18, 24]);
        const M = round2(C * (1 + i / 100) ** meses);
        const dobro = round2(C * 2);
        const tempoDobro = round2(Math.log(2) / Math.log(1 + i / 100));
        return { question: `${formatCurrency(C)} a ${i}% a.m. (compostos). Em quantos meses dobra? (aprox.)`, answer: tempoDobro, options: shuffle([tempoDobro, round2(100 / i), meses, round2(tempoDobro + 3)]) };
      },
    ),
    withTemplates(
      () => {
        const C = randInt(5000, 20000);
        const i = pick([1, 2, 3, 5]);
        const M = round2(C * (1 + i / 100) ** 12);
        const taxaEfetiva = round2(((1 + i / 100) ** 12 - 1) * 100);
        return { question: `Capital a ${i}% a.m. (compostos). Qual a taxa efetiva anual?`, answer: taxaEfetiva, options: shuffle([taxaEfetiva, round2(i * 12), round2(i * 12 + 1), taxaEfetiva + 0.5]) };
      },
      () => {
        const C = randInt(10000, 60000);
        const i = pick([0.5, 1, 1.5, 2]);
        const t = pick([12, 24, 36]);
        const M = round2(C * (1 + i / 100) ** t);
        return { question: `Investimento de ${formatCurrency(C)} a ${i}% a.m. (compostos) por ${t} meses. Montante final?`, answer: M, options: shuffle([M, round2(C * (1 + i / 100) * t), round2(C + C * (i / 100) * t), round2(M * 0.95)]) };
      },
    ),
  ],
};

const TOPIC_NIVEL = {
  adicao: 'fundamental',
  subtracao: 'fundamental',
  multiplicacao: 'fundamental',
  divisao: 'fundamental',
  expressoes: 'fundamental',
  fracao: 'fundamental',
  potenciacao: 'fundamental',
  mmc_mdc: 'fundamental',
  trigonometria: 'medio',
  conjuntos: 'fundamental',
  polinomios: 'medio',
  valores_absolutos: 'medio',
  proporcao: 'medio',
  regra_de_tres: 'medio',
  porcentagem: 'medio',
  equacoes: 'medio',
  equacoes_2grau: 'medio',
  funcoes: 'medio',
  logaritmos: 'superior',
  pa_pg: 'medio',
  analise_combinatoria: 'medio',
  matrizes: 'medio',
  geometria_plana: 'fundamental',
  angulos_tales: 'fundamental',
  geometria_espacial: 'medio',
  geometria_analitica: 'medio',
  numeros_complexos: 'superior',
  juros_simples: 'medio',
  juros_compostos: 'medio',
  estatistica: 'medio',
  probabilidade: 'medio',
  raciocinio_logico: 'superior',
};

function generateQuestion(topic, difficulty) {
  const generators = topicGenerators[topic];
  if (!generators || generators.length === 0) return null;
  const gen = pick(generators);
  return gen();
}

export function generateQuestionsForTopic(topic, difficulty, count = 10) {
  const questions = [];
  for (let i = 0; i < count; i++) {
    const q = generateQuestion(topic, difficulty);
    if (q) questions.push({ ...q, id: `${topic}-${Date.now()}-${i}`, topic, difficulty, nivel: TOPIC_NIVEL[topic] || 'medio', modalidade: 'multipla-escolha' });
  }
  return questions;
}

export function generateMixedQuestions(topics, difficulty, count = 15) {
  const questions = [];
  for (let i = 0; i < count; i++) {
    const topic = topics[i % topics.length];
    const q = generateQuestion(topic, difficulty);
    if (q) questions.push({ ...q, id: `mixed-${Date.now()}-${i}`, topic, difficulty, nivel: TOPIC_NIVEL[topic] || 'medio', modalidade: 'multipla-escolha' });
  }
  return shuffle(questions);
}

export const TOPICS = [
  { id: 'adicao', name: 'Adicao', category: 'Operacoes Basicas', icon: '+' },
  { id: 'subtracao', name: 'Subtracao', category: 'Operacoes Basicas', icon: '-' },
  { id: 'multiplicacao', name: 'Multiplicacao', category: 'Operacoes Basicas', icon: 'x' },
  { id: 'divisao', name: 'Divisao', category: 'Operacoes Basicas', icon: '/' },
  { id: 'expressoes', name: 'Expressoes Numericas', category: 'Operacoes Basicas', icon: '()' },
  { id: 'fracao', name: 'Fracoes', category: 'Numeros e Operacoes', icon: '\u00BD' },
  { id: 'potenciacao', name: 'Potenciacao e Radiciacao', category: 'Numeros e Operacoes', icon: '^' },
  { id: 'mmc_mdc', name: 'MMC e MDC', category: 'Numeros e Operacoes', icon: 'M' },
  { id: 'proporcao', name: 'Proporcao', category: 'Grandezas Proporcionais', icon: ':' },
  { id: 'regra_de_tres', name: 'Regra de Tres', category: 'Grandezas Proporcionais', icon: '\u00A7' },
  { id: 'porcentagem', name: 'Porcentagem', category: 'Grandezas Proporcionais', icon: '%' },
  { id: 'pa_pg', name: 'PA e PG', category: 'Grandezas Proporcionais', icon: '\u2191' },
  { id: 'equacoes', name: 'Equacoes 1o Grau', category: 'Algebra', icon: 'x=' },
  { id: 'equacoes_2grau', name: 'Equacoes 2o Grau', category: 'Algebra', icon: 'x\u00B2' },
  { id: 'funcoes', name: 'Funcoes', category: 'Algebra', icon: 'f(x)' },
  { id: 'logaritmos', name: 'Logaritmos', category: 'Algebra', icon: 'log' },
  { id: 'valores_absolutos', name: 'Valores Absolutos', category: 'Algebra', icon: '|x|' },
  { id: 'geometria_plana', name: 'Geometria Plana', category: 'Geometria', icon: '\u25B3' },
  { id: 'angulos_tales', name: 'Angulos e Tales', category: 'Geometria', icon: '\u2220' },
  { id: 'geometria_espacial', name: 'Geometria Espacial', category: 'Geometria', icon: '\u25A1' },
  { id: 'trigonometria', name: 'Trigonometria', category: 'Trigonometria', icon: '\u03B8' },
  { id: 'analise_combinatoria', name: 'Analise Combinatoria', category: 'Analise Combinatoria', icon: '!' },
  { id: 'conjuntos', name: 'Conjuntos Numericos', category: 'Conjuntos e Logica', icon: '\u2208' },
  { id: 'matrizes', name: 'Matrizes e Sistemas', category: 'Algebra Linear', icon: '[]' },
  { id: 'geometria_analitica', name: 'Geometria Analitica', category: 'Geometria', icon: '\u2190' },
  { id: 'polinomios', name: 'Polinomios', category: 'Algebra', icon: 'P(x)' },
  { id: 'numeros_complexos', name: 'Numeros Complexos', category: 'Algebra', icon: 'i' },
  { id: 'juros_simples', name: 'Juros Simples', category: 'Grandezas Proporcionais', icon: '$' },
  { id: 'juros_compostos', name: 'Juros Compostos', category: 'Grandezas Proporcionais', icon: '$$' },
  { id: 'estatistica', name: 'Estatistica Basica', category: 'Estatistica e Probabilidade', icon: '\u03BC' },
  { id: 'probabilidade', name: 'Probabilidade', category: 'Estatistica e Probabilidade', icon: 'P' },
  { id: 'raciocinio_logico', name: 'Raciocinio Logico', category: 'Raciocinio Logico', icon: '?' },
];

export const DIFFICULTY_LABELS = {
  1: 'Muito Facil',
  2: 'Facil',
  3: 'Medio',
  4: 'Dificil',
  5: 'Muito Dificil',
};

export const NIVEL_LABELS = {
  fundamental: 'Ensino Fundamental',
  medio: 'Ensino Medio',
  superior: 'Ensino Superior',
};

export const MODALIDADE_LABELS = {
  'multipla-escolha': 'Multipla Escolha',
  'certo-ou-errado': 'Certo ou Errado',
};
