import { config } from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const GEMINI_KEY = process.env.VITE_GEMINI_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!GEMINI_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Faltam variaveis de ambiente. Verifique .env.local:');
  console.error('  VITE_GEMINI_API_KEY');
  console.error('  VITE_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_KEY (service_role, nao a anon)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

const TOPICS = [
  { id: 'adicao', nivel: 'fundamental', desc: 'Adicao: operacoes diretas, soma de multiplas grandezas, adicao com decimais' },
  { id: 'subtracao', nivel: 'fundamental', desc: 'Subtracao: operacoes diretas, subtracao com decimais, subtracao com informacao irrelevante' },
  { id: 'multiplicacao', nivel: 'fundamental', desc: 'Multiplicacao: operacoes diretas, multiplicacao de grandezas, produto de fatores' },
  { id: 'divisao', nivel: 'fundamental', desc: 'Divisao: divisao exata, divisao com resto, velocidade media, rateio' },
  { id: 'expressoes', nivel: 'fundamental', desc: 'Expressoes numericas: precedencia de operacoes, parenteses, operacoes mistas' },
  { id: 'fracao', nivel: 'fundamental', desc: 'Fracoes: operacoes com fracoes, simplificacao, fracoes equivalentes' },
  { id: 'potenciacao', nivel: 'fundamental', desc: 'Potenciacao e radiciacao: potencias, raiz quadrada, raiz cubica, propriedades' },
  { id: 'mmc_mdc', nivel: 'fundamental', desc: 'MMC e MDC: minimo multiplo comum, maximo divisor comum, divisibilidade' },
  { id: 'proporcao', nivel: 'medio', desc: 'Proporcao: razao direta, razao inversa, grandezas proporcionais' },
  { id: 'regra_de_tres', nivel: 'medio', desc: 'Regra de tres: simples, composta, direta e inversa' },
  { id: 'porcentagem', nivel: 'medio', desc: 'Porcentagem: aumento, desconto, variacao percentual, acrescimo' },
  { id: 'pa_pg', nivel: 'medio', desc: 'Progressao aritmetica e geometrica: termos, soma, razao, soma dos n termos' },
  { id: 'equacoes', nivel: 'medio', desc: 'Equacoes de primeiro grau: resolucao, interpretacao, sistemas simples' },
  { id: 'equacoes_2grau', nivel: 'medio', desc: 'Equacoes de segundo grau: Bhaskara, discriminante, soma e produto de raizes' },
  { id: 'funcoes', nivel: 'medio', desc: 'Funcoes: funcao do 1o e 2o grau, avaliacao, funcao composta' },
  { id: 'logaritmos', nivel: 'superior', desc: 'Logaritmos: definicao, propriedades, equacoes logaritmicas' },
  { id: 'valores_absolutos', nivel: 'medio', desc: 'Valores absolutos: modulo de numero, equacoes com modulo, desigualdades' },
  { id: 'geometria_plana', nivel: 'fundamental', desc: 'Geometria plana: area e perimetro de figuras planas, Pitagoras' },
  { id: 'angulos_tales', nivel: 'fundamental', desc: 'Angulos e Teorema de Tales: complementares, suplementares, razao de Thales' },
  { id: 'geometria_espacial', nivel: 'medio', desc: 'Geometria espacial: volume e area de cubo, cilindro, esfera, prisma' },
  { id: 'trigonometria', nivel: 'medio', desc: 'Trigonometria: seno, cosseno, tangente, valores especiais, triangulos retangulos, identidades basicas' },
  { id: 'analise_combinatoria', nivel: 'medio', desc: 'Analise combinatoria: permutacao, arranjo, combinacao, fatorial' },
  { id: 'conjuntos', nivel: 'fundamental', desc: 'Conjuntos numericos: N, Z, Q, R, C, uniao, intersecao, subconjuntos' },
  { id: 'matrizes', nivel: 'medio', desc: 'Matrizes: operacoes com matrizes, determinante 2x2, sistemas lineares' },
  { id: 'geometria_analitica', nivel: 'medio', desc: 'Geometria analitica: distancia entre pontos, ponto medio, inclinacao de reta, equacao da reta' },
  { id: 'polinomios', nivel: 'medio', desc: 'Polinomios: avaliacao, produto notavel, divisor, teorema da resto, raizes' },
  { id: 'numeros_complexos', nivel: 'superior', desc: 'Numeros complexos: unidade imaginaria i, forma a+bi, modulo, operacoes basicas' },
  { id: 'estatistica', nivel: 'medio', desc: 'Estatistica basica: media, mediana, moda, media ponderada, amplitude' },
  { id: 'probabilidade', nivel: 'medio', desc: 'Probabilidade: evento simples, espaco amostral, probabilidade classica, combinacao' },
  { id: 'raciocinio_logico', nivel: 'superior', desc: 'Raciocinio logico: sequencias numericas, padroes, problemas logicos' },
];

const DELAY_MS = 2000;

async function generateQuestions(topic, difficulty) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Voce e um gerador de questoes para concurso publico de bombeiro militar no Brasil.

Gere 5 questoes de matematica no estilo multipla escolha (alternativas A a E).
Tema: ${topic.desc}
Nivel de dificuldade: ${difficulty} (1=muito facil, 2=facil, 3=medio, 4=dificil, 5=muito dificil)
Contexto: questoes para prova do CBM-BA (Corpo de Bombeiros Militar da Bahia)

IMPORTANTE:
- Cada questao deve ter EXATAMENTE 5 alternativas (A, B, C, D, E)
- A alternativa correta deve estardentro das 5 opcoes
- Resolva cada questao antes de gerar as alternativas para garantir que esta CORRETA
- Use contextos de bombeiros militares quando possivel (viaturas, equipamentos, operacoes)

Retorne APENAS um JSON valido (sem markdown, sem \`\`\`), um array com 5 objetos:
[
  {
    "question": "enunciado completo da questao",
    "answer": "alternativa correta (o texto exato da alternativa)",
    "options": ["A", "B", "C", "D", "E"]
  }
]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  let cleaned = text.trim();
  if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed) || parsed.length !== 5) {
    throw new Error(`Resposta inesperada: esperado 5 questoes, recebido ${parsed.length}`);
  }

  return parsed.map(q => ({
    topic: topic.id,
    difficulty,
    nivel: topic.nivel,
    modalidade: 'multipla-escolha',
    question: q.question,
    answer: q.answer,
    options: q.options,
    source: 'gemini',
  }));
}

async function main() {
  const topicArg = process.argv[2];
  const diffArg = process.argv[3];

  let topicsToRun = TOPICS;
  if (topicArg) {
    topicsToRun = TOPICS.filter(t => t.id === topicArg);
    if (topicsToRun.length === 0) {
      console.error(`Topic '${topicArg}' nao encontrado.`);
      console.error('Topics:', TOPICS.map(t => t.id).join(', '));
      process.exit(1);
    }
  }

  let diffsToRun = [1, 2, 3, 4, 5];
  if (diffArg) {
    const d = parseInt(diffArg);
    if (d < 1 || d > 5) { console.error('Dificuldade deve ser 1-5'); process.exit(1); }
    diffsToRun = [d];
  }

  let totalGeradas = 0;
  let totalErros = 0;

  for (const topic of topicsToRun) {
    for (const diff of diffsToRun) {
      process.stdout.write(`${topic.id} diff ${diff}... `);
      try {
        const questions = await generateQuestions(topic, diff);
        const { error } = await supabase.from('question_bank').insert(questions);
        if (error) {
          console.error('ERRO SUPABASE:', error.message);
          totalErros++;
        } else {
          console.log('OK (5 questoes)');
          totalGeradas += 5;
        }
      } catch (e) {
        console.error('ERRO:', e.message);
        totalErros++;
      }
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  console.log(`\n--- Resumo ---`);
  console.log(`Geradas: ${totalGeradas} questoes`);
  console.log(`Erros: ${totalErros}`);
}

main();
