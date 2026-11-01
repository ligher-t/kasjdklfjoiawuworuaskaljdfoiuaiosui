// Include zero and use evenly spaced decimal steps for either side of debt.
function endingMoneyScale(amounts) {
  const low = Math.min(0, ...amounts), high = Math.max(0, ...amounts);
  const rough = Math.max(1, high - low) / 3;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = Math.max(1, [1, 2, 5, 10].find(n => n * power >= rough) * power);
  const floor = Math.floor(low / step) * step;
  const ceil = high === low ? floor + step : Math.ceil(high / step) * step;
  const count = Math.round((ceil - floor) / step);
  const ticks = Array.from({length:count + 1}, (_,i) => Math.round((floor + i * step) * 100) / 100);
  return {floor, ceil, ticks};
}
// Ending-only chart: health/happiness are 0-100 indices; money is a separate scale.
const chart = history => {
  const rows = Array.isArray(history) ? history.filter(r => Array.isArray(r) && r.length >= 4 && r.slice(0,4).every(Number.isFinite)) : [];
  if (rows.length < 2) return '<p class="nt">比較できる時系列の記録がまだありません。</p>';
  const fmt = n=>Math.round(n).toLocaleString('ja-JP');
  const amounts = rows.map(r=>r[3]);
  const actualMin = Math.min(...amounts), actualMax = Math.max(...amounts);
  const money = endingMoneyScale(amounts);
  // Keep all digits within the plot, including large signed currency values.
  const W = 760, x0 = Math.max(64, ...money.ticks.map(v=>fmt(v).length * 10 + 16)), x1 = 744;
  const ages = rows.map(r=>r[0]), start = Math.min(...ages), end = Math.max(...ages);
  const x = age => x0+(age-start)/(end-start || 1)*(x1-x0);
  const yIndex = value => 40+(100-Math.max(0,Math.min(100,value)));
  const yMoney = value => 342-(value-money.floor)/(money.ceil-money.floor)*120;
  const line = (col,y)=>rows.map(r=>x(r[0]).toFixed(1)+','+y(r[col]).toFixed(1)).join(' ');
  const ticks = [0,25,50,75,100].map(value=>
    '<line x1="'+x0+'" x2="'+x1+'" y1="'+yIndex(value)+'" y2="'+yIndex(value)+'" stroke="var(--ui-border)" opacity=".55"/>'+
    '<text x="'+(x0-12)+'" y="'+(yIndex(value)+5)+'" text-anchor="end" fill="var(--ui-muted)" font-size="16">'+value+'</text>').join('');
  const moneyTicks = money.ticks.map(v=>
    '<line x1="'+x0+'" x2="'+x1+'" y1="'+yMoney(v)+'" y2="'+yMoney(v)+'" stroke="var(--ui-border)" opacity=".55"/>'+
    '<text x="'+(x0-12)+'" y="'+(yMoney(v)+5)+'" text-anchor="end" fill="var(--ui-muted)" font-size="16">'+fmt(v)+'</text>').join('');
  const last = rows[rows.length-1];
  const sampled = rows.length <= 12 ? rows : rows.filter((r,i)=>i===0||i===rows.length-1||i%5===0);
  return '<div class="ui-life-chart" role="group" aria-label="健康・幸福指数と資産の年齢別推移">'+
    '<div class="ui-life-chart-plot" tabindex="0" role="region" aria-label="年齢別グラフ。狭い画面では左右にスクロールできます。">'+
    '<svg viewBox="0 0 '+W+' 380" width="100%" role="img" aria-label="上段は健康・幸福の0〜100指数、下段は独立した資産目盛。横軸は年齢。">'+
    '<text x="'+x0+'" y="18" fill="var(--ui-muted)" font-size="16">健康・幸福 / 指数 0–100</text>'+ticks+
    '<polyline fill="none" stroke="var(--gd)" stroke-width="3" points="'+line(1,yIndex)+'"/>'+
    '<polyline fill="none" stroke="var(--ac)" stroke-width="3" stroke-dasharray="9 5" points="'+line(2,yIndex)+'"/>'+
    '<line x1="'+x0+'" x2="'+x1+'" y1="169" y2="169" stroke="var(--ui-border)"/>'+
    '<text x="'+x0+'" y="198" fill="var(--ui-muted)" font-size="16">純資産 / 龍門幣</text>'+moneyTicks+
    '<line x1="'+x0+'" x2="'+x1+'" y1="'+yMoney(0)+'" y2="'+yMoney(0)+'" stroke="var(--ui-muted)" stroke-dasharray="5 4"/>'+
    '<polyline fill="none" stroke="var(--ui-fg)" stroke-width="2.5" points="'+line(3,yMoney)+'"/>'+
    '<text x="'+x0+'" y="371" fill="var(--ui-muted)" font-size="16">'+start+'歳</text>'+
    '<text x="'+x1+'" y="371" text-anchor="end" fill="var(--ui-muted)" font-size="16">'+end+'歳</text></svg></div>'+
    '<p class="ui-life-chart-legend"><span style="color:var(--gd)">━ 健康</span><span style="color:var(--ac)">┄ 幸福</span><span>━ 純資産</span></p>'+
    '<p class="ui-life-chart-scroll-note nt">グラフは左右にスクロールできます。数値は下の記録でも確認できます。</p>'+
    '<p class="nt">最終記録：'+last[0]+'歳、健康 '+fmt(last[1])+'、幸福 '+fmt(last[2])+'、純資産 '+fmt(last[3])+'龍門幣。期間内の純資産：最小 '+fmt(actualMin)+'龍門幣、最大 '+fmt(actualMax)+'龍門幣。</p>'+
    '<details class="ui-life-chart-data"><summary>数値の記録を確認（'+(sampled.length===rows.length?'全'+rows.length:sampled.length+' / '+rows.length)+'時点）</summary><div class="ui-life-chart-table-scroll"><table><thead><tr><th scope="col">年齢</th><th scope="col">健康</th><th scope="col">幸福</th><th scope="col">純資産（龍門幣）</th></tr></thead><tbody>'+
    sampled.map(r=>'<tr><th scope="row">'+r[0]+'歳</th><td>'+fmt(r[1])+'</td><td>'+fmt(r[2])+'</td><td>'+fmt(r[3])+'</td></tr>').join('')+
    '</tbody></table></div>'+(sampled.length<rows.length?'<p class="nt">数表は最初・最後と5記録ごとの値を表示します。グラフにはすべての記録を使用しています。</p>':'')+'</details></div>';
};
