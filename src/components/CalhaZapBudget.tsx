"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Printer, Send, Sparkles, Scale, Info, 
  FileText, CheckCircle2, ChevronDown, PenSquare
} from 'lucide-react';

interface CalhaZapBudgetProps {
  user: any;
  companyName: string;
  companyCNPJ: string;
  companyPhone: string;
  companyCityState: string;
  companyLogo: string;
  verificarAtivo: () => boolean;
  exibirLock: (ttl: string, sub: string) => void;
  onSaveQuote: (quote: any) => void;
}

export default function CalhaZapBudget({
  user,
  companyName,
  companyCNPJ,
  companyPhone,
  companyCityState,
  companyLogo,
  verificarAtivo,
  exibirLock,
  onSaveQuote
}: CalhaZapBudgetProps) {
  // Client details
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [quoteDate, setQuoteDate] = useState(new Date().toLocaleDateString('pt-BR'));
  const [validDays, setValidDays] = useState(15);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentCondition, setPaymentCondition] = useState('À vista: 50% de entrada + 50% na entrega');
  const [notes, setNotes] = useState('Garantia de 1 ano contra infiltrações e oxidação natural.');

  // Current Selections
  const [selTile, setSelTile] = useState('Trapézio 25');
  const [selTileMat, setSelTileMat] = useState('Galvalume');
  const [tileQty, setTileQty] = useState(10);
  const [tileLen, setTileLen] = useState(3.5);
  const [tilePrice, setTilePrice] = useState(38.50);

  const [selCalha, setSelCalha] = useState('Calha Moldura');
  const [selCalhaMat, setSelCalhaMat] = useState('Galvalume');
  const [calhaCorte, setCalhaCorte] = useState(280);
  const [calhaEsp, setCalhaEsp] = useState('0,43');
  const [calhaLen, setCalhaLen] = useState(6.0);
  const [calhaPrice, setCalhaPrice] = useState(42.00);

  const [selRufo, setSelRufo] = useState('Rufo Encosto c/ Pingadeira');
  const [selRufoMat, setSelRufoMat] = useState('Galvalume');
  const [rufoCorte, setRufoCorte] = useState(250);
  const [rufoEsp, setRufoEsp] = useState('0,43');
  const [rufoLen, setRufoLen] = useState(4.0);
  const [rufoPrice, setRufoPrice] = useState(33.00);

  const [selCondutor, setSelCondutor] = useState('Retangular Galvalume 5x10');
  const [condutorLen, setCondutorLen] = useState(3.0);
  const [condutorPrice, setCondutorPrice] = useState(21.00);

  const [selChamine, setSelChamine] = useState('Chaminé de Lareira Galvanizada');
  const [chamineQty, setChamineQty] = useState(1);
  const [chamineDiam, setChamineDiam] = useState(150);
  const [chaminePrice, setChaminePrice] = useState(115.00);

  const [puQty, setPuQty] = useState(0);
  const [puPrice, setPuPrice] = useState(22.00);

  const [svcDesc, setSvcDesc] = useState('');
  const [svcQty, setSvcQty] = useState(1);
  const [svcPrice, setSvcPrice] = useState(150.00);

  const [extraDesc, setExtraDesc] = useState('');
  const [extraQty, setExtraQty] = useState(1);
  const [extraPrice, setExtraPrice] = useState(10.00);

  // Lists in Active Quote
  const [telhas, setTelhas] = useState<any[]>([]);
  const [calhas, setCalhas] = useState<any[]>([]);
  const [rufos, setRufos] = useState<any[]>([]);
  const [condutores, setCondutores] = useState<any[]>([]);
  const [chamines, setChamines] = useState<any[]>([]);
  const [moList, setMoList] = useState<any[]>([]);
  const [extras, setExtras] = useState<any[]>([]);

  // Math totals
  const calcTotal = () => {
    let sub = 0;
    telhas.forEach(it => { sub += it.total; });
    calhas.forEach(it => { sub += it.total; });
    rufos.forEach(it => { sub += it.total; });
    condutores.forEach(it => { sub += it.total; });
    chamines.forEach(it => { sub += it.total; });
    if (puQty > 0) { sub += puQty * puPrice; }
    moList.forEach(it => { sub += it.total; });
    extras.forEach(it => { sub += it.total; });

    const discVal = sub * (discountPercent / 100);
    const finalTot = Math.max(0, sub - discVal);
    return { subtotal: sub, discountAmount: discVal, total: finalTot };
  };

  const { subtotal, discountAmount, total } = calcTotal();

  // Item additions
  const handleAddTelha = () => {
    const spaceM2 = tileQty * tileLen;
    const itemTot = spaceM2 * tilePrice;
    setTelhas([...telhas, {
      id: Date.now().toString(),
      cat: 'TELHA',
      desc: `${selTile} — ${selTileMat} (${tileLen}m)`,
      specs: `${tileQty} un x ${tileLen}m = ${spaceM2.toFixed(1)}m²`,
      qtd: spaceM2,
      unit: tilePrice,
      total: itemTot
    }]);
  };

  const handleAddCalha = () => {
    const itemTot = calhaLen * calhaPrice;
    setCalhas([...calhas, {
      id: Date.now().toString(),
      cat: 'CALHA',
      desc: `${selCalha} — ${selCalhaMat}`,
      specs: `Corte ${calhaCorte}mm • Esp ${calhaEsp}mm • ${calhaLen}m`,
      qtd: calhaLen,
      unit: calhaPrice,
      total: itemTot
    }]);
  };

  const handleAddRufo = () => {
    const itemTot = rufoLen * rufoPrice;
    setRufos([...rufos, {
      id: Date.now().toString(),
      cat: 'RUFO',
      desc: `${selRufo} — ${selRufoMat}`,
      specs: `Corte ${rufoCorte}mm • Esp ${rufoEsp} • ${rufoLen}m`,
      qtd: rufoLen,
      unit: rufoPrice,
      total: itemTot
    }]);
  };

  const handleAddCondutor = () => {
    const itemTot = condutorLen * condutorPrice;
    setCondutores([...condutores, {
      id: Date.now().toString(),
      cat: 'CONDUTOR',
      desc: `Condutor ${selCondutor}`,
      specs: `${condutorLen}m de descida`,
      qtd: condutorLen,
      unit: condutorPrice,
      total: itemTot
    }]);
  };

  const handleAddChamine = () => {
    const itemTot = chamineQty * chaminePrice;
    setChamines([...chamines, {
      id: Date.now().toString(),
      cat: 'CHAMINÉ',
      desc: `${selChamine} Ø ${chamineDiam}mm`,
      specs: `${chamineQty} un`,
      qtd: chamineQty,
      unit: chaminePrice,
      total: itemTot
    }]);
  };

  const handleAddSvc = () => {
    if (!svcDesc) return;
    const itemTot = svcQty * svcPrice;
    setMoList([...moList, {
      id: Date.now().toString(),
      cat: 'SERVIÇO',
      desc: svcDesc,
      specs: `${svcQty} un / hora`,
      qtd: svcQty,
      unit: svcPrice,
      total: itemTot
    }]);
    setSvcDesc('');
  };

  const handleAddExtra = () => {
    if (!extraDesc) return;
    const itemTot = extraQty * extraPrice;
    setExtras([...extras, {
      id: Date.now().toString(),
      cat: 'EXTRA',
      desc: extraDesc,
      specs: `${extraQty} un`,
      qtd: extraQty,
      unit: extraPrice,
      total: itemTot
    }]);
    setExtraDesc('');
  };

  const handleRemoveItem = (id: string, listType: 'telhas' | 'calhas' | 'rufos' | 'condutores' | 'chamines' | 'mo' | 'extras') => {
    if (listType === 'telhas') setTelhas(telhas.filter(it => it.id !== id));
    if (listType === 'calhas') setCalhas(calhas.filter(it => it.id !== id));
    if (listType === 'rufos') setRufos(rufos.filter(it => it.id !== id));
    if (listType === 'condutores') setCondutores(condutores.filter(it => it.id !== id));
    if (listType === 'chamines') setChamines(chamines.filter(it => it.id !== id));
    if (listType === 'mo') setMoList(moList.filter(it => it.id !== id));
    if (listType === 'extras') setExtras(extras.filter(it => it.id !== id));
  };

  // Compile items to list
  const aggregateAllItems = () => {
    const arr: any[] = [];
    telhas.forEach(it => arr.push(it));
    calhas.forEach(it => arr.push(it));
    rufos.forEach(it => arr.push(it));
    condutores.forEach(it => arr.push(it));
    chamines.forEach(it => arr.push(it));
    if (puQty > 0) {
      arr.push({
        id: 'pu-40-row',
        cat: 'ACESSÓRIO',
        desc: 'Bisnagas de Vedação PU-40 400g',
        specs: `${puQty} bisnagas`,
        qtd: puQty,
        unit: puPrice,
        total: puQty * puPrice
      });
    }
    moList.forEach(it => arr.push(it));
    extras.forEach(it => arr.push(it));
    return arr;
  };

  const allItemsAggregated = aggregateAllItems();

  const triggerSaveAction = () => {
    if (total <= 0) {
      alert("Adicione alguns materiais antes de salvar.");
      return;
    }
    const docId = `CZ-${Date.now().toString().slice(-4)}`;
    const quotePayload = {
      id: docId,
      customerName: custName || "Cliente Avulso",
      customerPhone: custPhone,
      customerAddress: custAddress,
      telhas,
      calhas,
      rufos,
      condutores,
      chamines,
      puQty,
      puPrice,
      moList,
      extras,
      discountPercent,
      paymentCondition,
      validDays,
      notes,
      subtotal,
      discountAmount,
      total,
      date: quoteDate,
      status: 'pendente'
    };
    onSaveQuote(quotePayload);
  };

  const triggerExportWhatsapp = () => {
    if (!verificarAtivo()) {
      exibirLock(
        'Liberar Envio por WhatsApp',
        'O envio direto de propostas personalizadas requer a assinatura do <strong>CalhaZap Premium</strong>. Ative hoje!'
      );
      return;
    }

    if (total <= 0) {
      alert("Escreva uma proposta primeiro!");
      return;
    }

    const cleanCustName = custName || "Cliente";
    let text = `*ORÇAMENTO PROFISSIONAL — ${companyName}*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `*Cliente:* ${cleanCustName}\n`;
    if (custAddress) text += `*Local obra:* ${custAddress}\n`;
    text += `*Data:* ${quoteDate} (Validade: ${validDays} dias)\n\n`;
    text += `*ÍTENS DO ORÇAMENTO:*\n`;

    allItemsAggregated.forEach((item, i) => {
      text += `• _${item.desc}_\n   (${item.specs}) — R$ ${item.total.toFixed(2)}\n`;
    });

    text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `*Subtotal:* R$ ${subtotal.toFixed(2)}\n`;
    if (discountPercent > 0) text += `*Desconto (${discountPercent}%):* R$ ${discountAmount.toFixed(2)}\n`;
    text += `*TOTAL DO ORÇAMENTO: R$ ${total.toFixed(2)}*\n\n`;
    text += `*Condição Comercial:* ${paymentCondition}\n`;
    if (notes) text += `*Observação:* ${notes}\n\n`;
    text += `_Gerado profissionalmente pelo app CalhaZap_`;

    const zapUrl = `https://api.whatsapp.com/send?phone=55${custPhone.replace(/\D/g, '')}&text=${encodeURIComponent(text)}`;
    window.open(zapUrl, '_blank');
  };

  const triggerPrintInFrame = () => {
    if (!verificarAtivo()) {
      exibirLock(
        'Imprimir PDF Profissional',
        'A geração e download de PDFs com papel timbrado requer a ativação da sua <strong>licença CalhaZap Premium</strong>.'
      );
      return;
    }

    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert("Permita pop-ups no seu navegador para imprimir!");
      return;
    }

    const clientNm = custName || "Cliente Avulso";
    const headLogo = companyLogo ? `<img src="${companyLogo}" style="max-height: 52px; margin-bottom: 8px;" />` : '';

    const htmlRows = allItemsAggregated.map(item => `
      <tr style="border-bottom: 1px solid #b0b2b5; font-size: 11px;">
        <td style="padding: 6px; font-weight: bold; color: #1a1a1a;">${item.desc}<div style="font-size: 9px; font-weight: normal; color: #6a6a6a;">${item.specs}</div></td>
        <td style="padding: 6px; text-align: center; font-family: monospace;">${item.qtd.toFixed(1)}</td>
        <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${item.unit.toFixed(2)}</td>
        <td style="padding: 6px; text-align: right; font-family: monospace; font-weight: bold; color: #1a1a1a;">R$ ${item.total.toFixed(2)}</td>
      </tr>
    `).join('');

    printWin.document.write(`
      <html>
        <head>
          <title>Orçamento_${clientNm}</title>
          <style>
            body { font-family: 'Helvetica', system-ui, sans-serif; background: #ffffff; color: #1a1a1a; margin: 25px; }
            .header-tbl { width: 100%; border-bottom: 3px solid #5a5c5f; padding-bottom: 12px; margin-bottom: 15px; }
            .client-tbl { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
            .client-tbl td { padding: 6px; font-size: 12px; }
            .items-tbl { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
            .items-tbl th { background: #5a5c5f; color: #fff; padding: 8px; font-size: 11px; text-transform: uppercase; }
            .footer-tbl { width: 100%; font-size: 11px; margin-top: 30px; border-top: 1px solid #b0b2b5; padding-top: 15px; }
          </style>
        </head>
        <body>
          <table class="header-tbl">
            <tr>
              <td>
                ${headLogo}
                <div style="font-size: 16px; font-weight: bold; color: #5a5c5f;">${companyName}</div>
                <div style="font-size: 11px; font-weight: bold; color: #6a6a6a;">CNPJ: ${companyCNPJ} • Contato: ${companyPhone} • ${companyCityState}</div>
              </td>
              <td style="text-align: right; vertical-align: top;">
                <div style="font-size: 14px; font-weight: bold; color: #e0b400;">ORÇAMENTO DE CALHARIA</div>
                <div style="font-size: 11px; font-weight: bold; font-family: monospace; color: #3a3a3a; margin-top: 4px;">EMISSÃO: ${quoteDate}</div>
                <div style="font-size: 10px; font-weight: bold; color: #6a6a6a;">Válido por ${validDays} dias</div>
              </td>
            </tr>
          </table>

          <table class="client-tbl" border="1" bordercolor="#b0b2b5">
            <tr style="background-color: #f2f3f4; font-weight: bold;">
              <td colspan="2" style="font-size: 11px; text-transform: uppercase; color: #5a5c5f;">DADOS DA OBRA / CLIENTE</td>
            </tr>
            <tr>
              <td style="width: 50%;"><strong>Cliente:</strong> ${clientNm}</td>
              <td><strong>WhatsApp:</strong> ${custPhone || 'Não informado'}</td>
            </tr>
            <tr>
              <td colspan="2"><strong>Endereço da Instalação:</strong> ${custAddress || 'Entrega física na oficina'}</td>
            </tr>
          </table>

          <table class="items-tbl">
            <thead>
              <tr>
                <th style="text-align: left;">Descrição do Material & Aplicação</th>
                <th>Qtd/M²</th>
                <th style="text-align: right;">Unitário</th>
                <th style="text-align: right;">Total Item</th>
              </tr>
            </thead>
            <tbody>
              ${htmlRows}
            </tbody>
          </table>

          <div style="float: right; width: 280px; font-size: 12px; margin-bottom: 30px;">
            <table width="100%" border="0" style="border-collapse: collapse;">
              <tr>
                <td style="padding: 4px; color: #3a3a3a;">Subtotal Materiais:</td>
                <td style="padding: 4px; text-align: right; font-family: monospace;">R$ ${subtotal.toFixed(2)}</td>
              </tr>
              ${discountPercent > 0 ? `
              <tr>
                <td style="padding: 4px; color: #c62828;">Desconto (${discountPercent}%):</td>
                <td style="padding: 4px; text-align: right; color: #c62828; font-family: monospace;">- R$ ${discountAmount.toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr style="border-top: 2px solid #5a5c5f; font-weight: bold; font-size: 14px;">
                <td style="padding: 8px 4px; color: #1a1a1a;">TOTAL COMERCIAL:</td>
                <td style="padding: 8px 4px; text-align: right; color: #2e7d32; font-family: monospace;">R$ ${total.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div style="clear: both;"></div>

          <table class="footer-tbl">
            <tr>
              <td style="width: 60%; vertical-align: top;">
                <strong>Condições de Pagamento:</strong><br/>
                ${paymentCondition}<br/><br/>
                <strong>Termo de Compromisso:</strong><br/>
                ${notes}
              </td>
              <td style="text-align: center; vertical-align: bottom;">
                <br/><br/><br/>
                <div style="border-top: 1px solid #1a1a1a; width: 200px; margin: 0 auto;"></div>
                <div style="font-size: 10px; font-weight: bold; color: #3a3a3a; margin-top: 4px;">Assinatura do Responsável</div>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `);

    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* LEFT FORM WORKSPACE */}
      <div className="space-y-6">
        {/* Client details Card */}
        <div className="bg-[#f2f3f4] rounded-2xl border border-[#b0b2b5] p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-[#5a5c5f] uppercase tracking-wider flex items-center gap-2 border-l-4 border-[#f5c800] pl-2">
            👤 Ficha do Cliente & Localização
          </h3>
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#3a3a3a]">Nome ou Empresa</label>
                <input
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#3a3a3a]">WhatsApp (DDD+Número)</label>
                <input
                  type="text"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder="Ex: 11999990000"
                  className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3a3a3a]">Endereço Completo de Entrega/Obra</label>
              <input
                type="text"
                value={custAddress}
                onChange={(e) => setCustAddress(e.target.value)}
                placeholder="Ex: Rua das Flores, 123 - Centro"
                className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-xs font-semibold outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pb-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#3a3a3a]">Dias de Validade</label>
                <input
                  type="number"
                  value={validDays || ""}
                  onChange={(e) => setValidDays(Math.max(1, parseInt(e.target.value) || 0))}
                  placeholder="Ex: 15"
                  className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#3a3a3a]">Desconto Comercial (%)</label>
                <input
                  type="number"
                  value={discountPercent || ""}
                  onChange={(e) => setDiscountPercent(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))}
                  placeholder="Ex: 5"
                  className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TELHAS CUSTOM MODULE */}
        <div className="bg-[#f2f3f4] rounded-2xl border border-[#b0b2b5] p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-[#5a5c5f] uppercase tracking-wider flex items-center justify-between border-l-4 border-[#f5c800] pl-2">
            <span>🏠 Telhas — Cobertura Metálica</span>
            <span className="text-[10px] bg-sky-200 text-sky-800 font-bold px-2 py-0.5 rounded uppercase">M²</span>
          </h3>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'Trapézio 25', label: 'T-25', p: 'M-M-M' },
              { id: 'Trapézio 40', label: 'T-40', p: 'M-v-M' },
              { id: 'Sanduíche', label: 'Sanduíche', p: 'M-==-M' },
              { id: 'Ondulada', label: 'Ondulada', p: 'S-S-S' }
            ].map(model => (
              <button
                key={model.id}
                onClick={() => setSelTile(model.id)}
                className={`py-2 px-1 rounded-xl font-bold border transition text-center flex flex-col items-center justify-center cursor-pointer ${
                  selTile === model.id ? 'border-[#e0b400] bg-[#fff9c4]' : 'border-[#b0b2b5] bg-white'
                }`}
              >
                <span className="text-[10px] font-condensed tracking-wider uppercase text-[#5a5c5f]">{model.label}</span>
                <span className="text-[10px] font-mono font-black text-amber-600 mt-1">{model.p}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap pb-1">
            {['Galvalume #26', 'Galvalume #28', 'Galvanizado #26', 'Alumínio'].map(mat => (
              <button
                key={mat}
                onClick={() => setSelTileMat(mat)}
                className={`flex-1 text-[11px] font-bold py-1.5 border rounded-lg transition ${
                  selTileMat === mat ? 'border-[#e0b400] bg-[#f5c800]' : 'border-[#b0b2b5] bg-white'
                }`}
              >
                {mat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-bold text-[#3a3a3a] block mb-1">Qtd (un)</label>
              <input
                type="number"
                value={tileQty || ""}
                onChange={(e) => setTileQty(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-white border border-[#b0b2b5] rounded-xl px-2 py-1.5 text-center outline-none font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#3a3a3a] block mb-1">Comprim. (m)</label>
              <input
                type="number"
                value={tileLen || ""}
                onChange={(e) => setTileLen(Math.max(0.1, parseFloat(e.target.value) || 0))}
                className="w-full bg-white border border-[#b0b2b5] rounded-xl px-2 py-1.5 text-center outline-none font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#3a3a3a] block mb-1">Preço R$/m²</label>
              <input
                type="number"
                value={tilePrice || ""}
                onChange={(e) => setTilePrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-white border border-[#b0b2b5] rounded-xl px-2 py-1.5 text-center outline-none font-bold text-amber-800"
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-xs pt-1">
            <span className="font-semibold text-[#6a6a6a]">Subtotal Previsto:</span>
            <span className="font-black text-[#1a1a1a]">R$ {(tileQty * tileLen * tilePrice).toFixed(2)}</span>
          </div>

          <button
            onClick={handleAddTelha}
            className="w-full py-2 bg-zinc-700 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer leading-tight uppercase font-condensed tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar cobertura de telha</span>
          </button>
        </div>

        {/* CALHAS DADO DO CURSO */}
        <div className="bg-[#f2f3f4] rounded-2xl border border-[#b0b2b5] p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-[#5a5c5f] uppercase tracking-wider flex items-center justify-between border-l-4 border-[#f5c800] pl-2">
            <span>🌊 Calhas — Condutores D'água</span>
            <span className="text-[10px] bg-zinc-300 text-[#5a5c5f] font-bold px-2 py-0.5 rounded uppercase">Metro</span>
          </h3>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'Calha Moldura', label: 'Moldura', shape: '└─┐' },
              { id: 'Calha Americana', label: 'Americana', shape: '╰─╯' },
              { id: 'Calha Quadrada', label: 'Quadrada', shape: '└──┘' },
              { id: 'Platibanda', label: 'Platibanda', shape: '│__│' }
            ].map(cal => (
              <button
                key={cal.id}
                onClick={() => setSelCalha(cal.id)}
                className={`py-2 px-1 rounded-xl font-bold border transition text-center flex flex-col items-center justify-center cursor-pointer ${
                  selCalha === cal.id ? 'border-[#e0b400] bg-[#fff9c4]' : 'border-[#b0b2b5] bg-white'
                }`}
              >
                <span className="text-[10px] font-condensed tracking-wider uppercase text-[#5a5c5f]">{cal.label}</span>
                <span className="text-[10px] font-mono font-black text-blue-600 mt-1">{cal.shape}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap pb-1">
            {['Galvanizada', 'Galvalume', 'Alumínio', 'Pré-pintada'].map(mat => (
              <button
                key={mat}
                onClick={() => setSelCalhaMat(mat)}
                className={`flex-1 text-[11px] font-bold py-1.5 border rounded-lg transition ${
                  selCalhaMat === mat ? 'border-[#e0b400] bg-[#f5c800]' : 'border-[#b0b2b5] bg-white'
                }`}
              >
                {mat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2 text-xs">
            <div>
              <label className="text-[9px] font-bold text-[#3a3a3a] block mb-1">Corte (mm)</label>
              <input
                type="number"
                value={calhaCorte || ""}
                onChange={(e) => setCalhaCorte(Math.max(100, parseInt(e.target.value) || 0))}
                className="w-full bg-white border border-[#b0b2b5] rounded-xl px-1.5 py-1.5 text-center outline-none font-bold"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-[#3a3a3a] block mb-1">Esp (mm)</label>
              <select
                value={calhaEsp}
                onChange={(e) => setCalhaEsp(e.target.value)}
                className="w-full bg-white border border-[#b0b2b5] rounded-xl px-1.5 py-1.5 text-center outline-none font-bold text-[10px]"
              >
                <option>0,40</option>
                <option>0,43</option>
                <option>0,47</option>
                <option>0,50</option>
                <option>0,65</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold text-[#3a3a3a] block mb-1">Metro (m)</label>
              <input
                type="number"
                value={calhaLen || ""}
                onChange={(e) => setCalhaLen(Math.max(0.1, parseFloat(e.target.value) || 0))}
                className="w-full bg-white border border-[#b0b2b5] rounded-xl px-1.5 py-1.5 text-center outline-none font-bold"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-[#3a3a3a] block mb-1">R$/Metro</label>
              <input
                type="number"
                value={calhaPrice || ""}
                onChange={(e) => setCalhaPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-white border border-[#b0b2b5] rounded-xl px-1.5 py-1.5 text-center outline-none font-bold text-amber-800"
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-xs pt-1">
            <span className="font-semibold text-[#6a6a6a]">Subtotal Previsto:</span>
            <span className="font-black text-[#1a1a1a]">R$ {(calhaLen * calhaPrice).toFixed(2)}</span>
          </div>

          <button
            onClick={handleAddCalha}
            className="w-full py-2 bg-zinc-700 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer leading-tight uppercase font-condensed tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar trecho de calha</span>
          </button>
        </div>

        {/* RUFOS CUSTOM MODULE */}
        <div className="bg-[#f2f3f4] rounded-2xl border border-[#b0b2b5] p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-[#5a5c5f] uppercase tracking-wider flex items-center justify-between border-l-4 border-[#f5c800] pl-2">
            <span>🛡️ Rufos & Pingadeiras</span>
            <span className="text-[10px] bg-zinc-300 text-[#5a5c5f] font-bold px-2 py-0.5 rounded uppercase">Metro</span>
          </h3>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'Rufo Encosto c/ Pingadeira', label: 'E. Ping', s: '├──' },
              { id: 'Rufo Encosto', label: 'Encosto', s: '│__' },
              { id: 'Rufo Pingadeira', label: 'Wall Cap', s: '┌──┐' },
              { id: 'Cumeeira', label: 'Cumeeira', s: '▲' }
            ].map(ruf => (
              <button
                key={ruf.id}
                onClick={() => setSelRufo(ruf.id)}
                className={`py-2 px-1 rounded-xl font-bold border transition text-center flex flex-col items-center justify-center cursor-pointer ${
                  selRufo === ruf.id ? 'border-[#e0b400] bg-[#fff9c4]' : 'border-[#b0b2b5] bg-white'
                }`}
              >
                <span className="text-[10px] font-condensed tracking-wider uppercase text-[#5a5c5f] leading-none mb-1">{ruf.label}</span>
                <span className="text-[10px] font-mono font-black text-rose-600">{ruf.s}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap pb-1">
            {['Galvanizado', 'Galvalume', 'Alumínio'].map(mat => (
              <button
                key={mat}
                onClick={() => setSelRufoMat(mat)}
                className={`flex-1 text-[11px] font-bold py-1.5 border rounded-lg transition ${
                  selRufoMat === mat ? 'border-[#e0b400] bg-[#f5c800]' : 'border-[#b0b2b5] bg-white'
                }`}
              >
                {mat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2 text-xs">
            <div>
              <label className="text-[9px] font-bold text-[#3a3a3a] block mb-1">Corte (mm)</label>
              <input
                type="number"
                value={rufoCorte || ""}
                onChange={(e) => setRufoCorte(Math.max(100, parseInt(e.target.value) || 0))}
                className="w-full bg-white border border-[#b0b2b5] rounded-xl px-1.5 py-1.5 text-center outline-none font-bold"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-[#3a3a3a] block mb-1">Esp (mm)</label>
              <select
                value={rufoEsp}
                onChange={(e) => setRufoEsp(e.target.value)}
                className="w-full bg-white border border-[#b0b2b5] rounded-xl px-1.5 py-1.5 text-center outline-none font-bold text-[10px]"
              >
                <option>0,40</option>
                <option>0,43</option>
                <option>0,47</option>
                <option>0,50</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold text-[#3a3a3a] block mb-1">Metro (m)</label>
              <input
                type="number"
                value={rufoLen || ""}
                onChange={(e) => setRufoLen(Math.max(0.1, parseFloat(e.target.value) || 0))}
                className="w-full bg-white border border-[#b0b2b5] rounded-xl px-1.5 py-1.5 text-center outline-none font-bold"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-[#3a3a3a] block mb-1">R$/Metro</label>
              <input
                type="number"
                value={rufoPrice || ""}
                onChange={(e) => setRufoPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-white border border-[#b0b2b5] rounded-xl px-1.5 py-1.5 text-center outline-none font-bold text-amber-800"
              />
            </div>
          </div>

          <button
            onClick={handleAddRufo}
            className="w-full py-2 bg-zinc-700 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer leading-tight uppercase font-condensed tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar rufo impermeável</span>
          </button>
        </div>

        {/* DOWNPIPES (CONDUTORES) */}
        <div className="bg-[#f2f3f4] rounded-2xl border border-[#b0b2b5] p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-[#5a5c5f] uppercase tracking-wider flex items-center gap-2 border-l-4 border-[#f5c800] pl-2">
            🪵 Tubos Condutores de Descida
          </h3>
          <div className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3a3a3a]">Modelo do Condutor</label>
              <select
                value={selCondutor}
                onChange={(e) => setSelCondutor(e.target.value)}
                className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-xs font-semibold outline-none text-[#1a1a1a]"
              >
                <option>Retangular Galvalume 5x10</option>
                <option>Retangular Galvanizado 5x10</option>
                <option>Redondo Ø3 Polegadas (Galvalume)</option>
                <option>Redondo Ø4 Polegadas (Galvanizado)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#3a3a3a]">Meters linear (m)</label>
                <input
                  type="number"
                  value={condutorLen || ""}
                  onChange={(e) => setCondutorLen(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#3a3a3a]">R$ por metro</label>
                <input
                  type="number"
                  value={condutorPrice || ""}
                  onChange={(e) => setCondutorPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-xs font-semibold text-amber-800 outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleAddCondutor}
              className="w-full py-2 bg-zinc-700 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer font-condensed tracking-wider uppercase"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar condutor de descida</span>
            </button>
          </div>
        </div>

        {/* CHAMINÉS E COIFAS */}
        <div className="bg-[#f2f3f4] rounded-2xl border border-[#b0b2b5] p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-[#5a5c5f] uppercase tracking-wider flex items-center gap-2 border-l-4 border-[#f5c800] pl-2">
            🎩 Chaminés, Coifas & Chapéus
          </h3>
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#3a3a3a]">Modelo</label>
                <select
                  value={selChamine}
                  onChange={(e) => setSelChamine(e.target.value)}
                  className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-xs font-semibold outline-none text-[#1a1a1a]"
                >
                  <option>Chaminé de Lareira Galvanizada</option>
                  <option>Chaminé de Aquecedor Alumínio</option>
                  <option>Chapéu Chinês para duto redondo</option>
                  <option>Coifa de Churrasqueira pré-moldada</option>
                  <option>Exaustor de Teto Giratório</option>
                  <option>Cotovelo / Joelho de 90° em duto</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#3a3a3a]">Diâmetro (Ø mm)</label>
                <input
                  type="number"
                  value={chamineDiam || ""}
                  onChange={(e) => setChamineDiam(Math.max(50, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#3a3a3a]">Quantidade (un)</label>
                <input
                  type="number"
                  value={chamineQty || ""}
                  onChange={(e) => setChamineQty(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#3a3a3a]">Valor Unitário (R$)</label>
                <input
                  type="number"
                  value={chaminePrice || ""}
                  onChange={(e) => setChaminePrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-xs font-semibold text-amber-800 outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleAddChamine}
              className="w-full py-2 bg-zinc-700 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer font-condensed tracking-wider uppercase"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar duto / chaminé</span>
            </button>
          </div>
        </div>

        {/* PU-40 SYSTEM SEALANT COEFF */}
        <div className="bg-[#f2f3f4] rounded-2xl border border-[#b0b2b5] p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-[#5a5c5f] uppercase tracking-wider flex items-center gap-2 border-l-4 border-[#f5c800] pl-2">
            🧴 Silicone PU-40 de Vedação das Emendas
          </h3>
          <p className="text-[10px] text-[#6a6a6a] font-semibold">
            Inclusão automática nas estimativas finais do orçamento timbrado do cliente.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3a3a3a]">Bisnagas cinza/preto</label>
              <input
                type="number"
                value={puQty || ""}
                onChange={(e) => setPuQty(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="Ex: 4"
                className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-xs font-semibold outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3a3a3a]">Preço por Bisnaga (R$)</label>
              <input
                type="number"
                value={puPrice || ""}
                onChange={(e) => setPuPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-xs font-semibold text-amber-800 outline-none"
              />
            </div>
          </div>
        </div>

        {/* MÃO DE OBRA */}
        <div className="bg-[#f2f3f4] rounded-2xl border border-[#b0b2b5] p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-[#5a5c5f] uppercase tracking-wider flex items-center gap-2 border-l-4 border-[#f5c800] pl-2">
            🔨 Mão de Obra, Instalação & Serviços
          </h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3a3a3a]">Descrição do Serviço Técnico</label>
              <input
                type="text"
                value={svcDesc}
                onChange={(e) => setSvcDesc(e.target.value)}
                placeholder="Ex: Instalação das calhas no beiral traseiro c/ andaime"
                className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-xs font-semibold outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#3a3a3a]">Qtd de Técnicos / Dias</label>
                <input
                  type="number"
                  value={svcQty || ""}
                  onChange={(e) => setSvcQty(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#3a3a3a]">Preço Cobrado (R$)</label>
                <input
                  type="number"
                  value={svcPrice || ""}
                  onChange={(e) => setSvcPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-xs font-semibold text-amber-800 outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleAddSvc}
              className="w-full py-2 bg-zinc-700 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer font-condensed tracking-wider uppercase"
            >
              <Plus className="w-4 h-4" />
              <span>Inserir serviço técnico</span>
            </button>
          </div>
        </div>

        {/* OUTROS EXTRAS / CONDIÇÕES */}
        <div className="bg-[#f2f3f4] rounded-2xl border border-[#b0b2b5] p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-[#5a5c5f] uppercase tracking-wider flex items-center gap-2 border-l-4 border-[#f5c800] pl-2">
            🏷️ Condições Comerciais, Extras & Observação
          </h3>
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#3a3a3a]">Condições de Pagamento</label>
                <input
                  type="text"
                  value={paymentCondition}
                  onChange={(e) => setPaymentCondition(e.target.value)}
                  placeholder="Ex: 50% ato, 50% entrega"
                  className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#3a3a3a]">Garantias / Avisos</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Garantia de 1 ano"
                  className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                />
              </div>
            </div>

            <div className="border-t border-[#b0b2b5] pt-3 mt-1 space-y-2">
              <span className="text-xs font-bold text-[#3a3a3a] block uppercase mb-1">Adicionar Item Extra/Acessório Avulso:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={extraDesc}
                  onChange={(e) => setExtraDesc(e.target.value)}
                  placeholder="Nome do assessório. Ex: Grelha"
                  className="col-span-1 sm:col-span-1 bg-white border border-[#b0b2b5] rounded-lg px-2.5 py-1 text-xs outline-none font-bold"
                />
                <input
                  type="number"
                  value={extraQty || ""}
                  onChange={(e) => setExtraQty(Math.max(1, parseInt(e.target.value) || 0))}
                  placeholder="Qtd"
                  className="w-full bg-white border border-[#b0b2b5] rounded-lg px-2.5 py-1 text-xs outline-none"
                />
                <input
                  type="number"
                  value={extraPrice || ""}
                  onChange={(e) => setExtraPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="R$ / un"
                  className="w-full bg-white border border-[#b0b2b5] rounded-lg px-2.5 py-1 text-xs outline-none"
                />
              </div>
              <button
                onClick={handleAddExtra}
                className="w-full py-1.5 bg-zinc-600 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer leading-tight uppercase font-condensed mt-1"
              >
                <Plus className="w-4 h-4" />
                <span>Anexar item de convenção avulso</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE LIVE ORÇAMENTO TIMBRADO PREVIEW */}
      <div className="space-y-4 lg:sticky lg:top-4 bg-white rounded-3xl border border-[#b0b2b5] p-5 shadow-lg relative flex flex-col justify-between">
        <div>
          {/* Header row with logo info */}
          <div className="border-b-4 border-[#5a5c5f] pb-3 mb-4 flex justify-between items-start">
            <div className="space-y-1">
              {companyLogo ? (
                <img src={companyLogo} alt={companyName} className="max-h-12 object-contain rounded-lg" />
              ) : (
                <div className="bg-[#f5c800] text-[#5a5c5f] font-black tracking-widest px-3 py-1 text-sm font-condensed rounded-lg inline-block">
                  📂 CALHAZAP
                </div>
              )}
              <h4 className="text-sm font-extrabold text-[#5a5c5f] uppercase tracking-wide leading-none">{companyName}</h4>
              <p className="text-[10px] text-[#6a6a6a] font-bold">
                CNPJ: {companyCNPJ || "00.000.000/0001-00"} • Fone: {companyPhone || "—"}
              </p>
              <p className="text-[9px] text-[#8a8c8f] font-semibold">{companyCityState || "—"}</p>
            </div>

            <div className="text-right space-y-1">
              <span className="text-[10px] bg-[#fff9c4] border border-[#e0b400] text-amber-850 font-black tracking-widest px-2.5 py-0.5 rounded font-condensed">
                PROPOSTA COMERCIAL
              </span>
              <p className="text-[10px] text-[#1a1a1a] font-mono font-bold mt-1.5">DATA: {quoteDate}</p>
              <p className="text-[9px] text-[#6a6a6a] font-bold uppercase">Validade: {validDays} dias</p>
            </div>
          </div>

          {/* Client summary Card */}
          <div className="bg-[#f2f3f4] rounded-xl border border-[#b0b2b5] px-3.5 py-2.5 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 leading-normal">
            <div>
              <span className="text-[9px] text-[#6a6a6a] uppercase font-bold block leading-none mb-1">CLIENTE / OBRA</span>
              <span className="font-extrabold text-[#1a1a1a] text-[13px]">{custName || "Consumidor Final Avulso"}</span>
              <span className="block text-[#6a6a6a] text-[10px] mt-1 font-semibold">{custAddress || "Entrega direta na metalúrgica"}</span>
            </div>
            <div className="sm:text-right sm:border-l border-[#b0b2b5] sm:pl-3">
              <span className="text-[9px] text-[#6a6a6a] uppercase font-bold block leading-none mb-1">WHATSAPP</span>
              <span className="font-mono font-bold font-condensed text-zinc-800 text-sm">{custPhone || "—"}</span>
            </div>
          </div>

          {/* Table display */}
          <div className="bg-white rounded-xl border border-[#b0b2b5] overflow-hidden my-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#5a5c5f] text-[#f5c800] uppercase text-[9px] font-black">
                  <th className="p-2 border-b border-[#b0b2b5]">Item / Matérias</th>
                  <th className="p-2 border-b border-[#b0b2b5] text-center">Quant.</th>
                  <th className="p-2 border-b border-[#b0b2b5] text-right">R$ Un.</th>
                  <th className="p-2 border-b border-[#b0b2b5] text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {allItemsAggregated.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-[#6a6a6a] font-bold uppercase text-[10px]">
                      🏖️ Nenhum item inserido na proposta comercial.
                    </td>
                  </tr>
                ) : (
                  allItemsAggregated.map((it) => (
                    <tr key={it.id} className="border-b border-[#b0b2b5] hover:bg-zinc-50 leading-tight">
                      <td className="p-2 border-r border-[#b0b2b5]">
                        <span className="font-black text-[#1a1a1a] block text-[11px] uppercase">{it.desc}</span>
                        <span className="text-[9px] text-[#6a6a6a] font-semibold">{it.specs}</span>
                      </td>
                      <td className="p-2 border-r border-[#b0b2b5] text-center font-mono font-bold text-[#3a3a3a]">{it.qtd.toFixed(1)}</td>
                      <td className="p-2 border-r border-[#b0b2b5] text-right font-mono font-semibold">R$ {it.unit.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono font-bold text-[#1a1a1a]">R$ {it.total.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Commercial values rows */}
          <div className="flex flex-col gap-1.5 items-end px-2 pt-1 border-t border-[#b0b2b5]">
            <div className="flex justify-between w-64 text-xs font-semibold text-[#6a6a6a]">
              <span>Subtotal Itens:</span>
              <span className="font-mono">R$ {subtotal.toFixed(2)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between w-64 text-xs font-bold text-red-650">
                <span>Desconto ({discountPercent}%):</span>
                <span className="font-mono">- R$ {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between w-64 bg-[#f5c800] text-[#5a5c5f] font-black text-sm p-2 rounded-xl mt-1.5 shadow-sm border border-[#e0b400]">
              <span className="text-xs uppercase shrink-0 font-condensed tracking-wider mt-0.5">Total Geral Líquido</span>
              <span className="font-mono text-base font-black">R$ {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-[#f2f3f4] rounded-xl border border-[#b0b2b5] px-3 py-2 text-[11px] leading-relaxed mt-4 font-semibold text-[#3a3a3a] space-y-1">
            <div>💳 <strong>Condição Comercial:</strong> {paymentCondition}</div>
            {notes && <div>🧾 <strong>Garantia & Acabamento:</strong> {notes}</div>}
          </div>
        </div>

        {/* Floating actions board */}
        <div className="grid grid-cols-3 gap-2 font-bold border-t border-[#b0b2b5] pt-4 mt-6 bg-white shrink-0">
          <button
            onClick={triggerPrintInFrame}
            className="py-3 px-1 border-2 border-[#8a8c8f] hover:bg-zinc-100 text-[#5a5c5f] rounded-xl text-xs transition flex flex-col items-center gap-1.5 cursor-pointer font-condensed tracking-wider uppercase bg-white relative shadow-sm"
          >
            <Printer className="w-5 h-5 shrink-0 text-slate-600" />
            <span>Imprimir PDF</span>
          </button>

          <button
            onClick={triggerExportWhatsapp}
            className="py-3 px-1 border-2 border-emerald-600 hover:bg-emerald-50 text-emerald-700 rounded-xl text-xs transition flex flex-col items-center gap-1.5 cursor-pointer font-condensed tracking-wider uppercase bg-white relative shadow-sm"
          >
            <Send className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={triggerSaveAction}
            className="py-3 px-1 border-2 border-[#e0b400] bg-[#f5c800] hover:bg-[#e0b400] text-[#5a5c5f] rounded-xl text-xs transition flex flex-col items-center gap-1.5 cursor-pointer font-condensed tracking-wider uppercase relative shadow-md"
          >
            <PenSquare className="w-5 h-5 shrink-0" />
            <span>Salvar Registro</span>
          </button>
        </div>
      </div>
    </div>
  );
}
