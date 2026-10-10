// Independent expected membership/floor fixtures. Update only after a reviewed data change.
const groups = {
  blue: ['g1-1','g1-2','g1-3','g1-4','g1-5','g1-6','g1-7','g1-8'],
  purple: ['g1-3','g2-1','g2-2','g2-3','g2-4','g1-6','g1-8','g2-5'],
  red: ['g1-1','g2-3','g3-1','g1-4','g3-2','g3-3','g3-4','g3-5'],
  green: ['g4-1','g3-1','g2-4','g4-2','g4-3','g2-5','g3-4','g3-3']
};
const bottom = ['g1-7','g1-8','g2-5','g3-3','g3-4','g3-5'];
const ids = [...new Set(Object.values(groups).flat())];
const colors = {blue:'#6fa5db',purple:'#a98bc9',red:'#c86c6c',green:'#82b97b'};
const sorted = values => Array.from(values).sort();
const union = seeds => [...new Set(seeds.flatMap(seed => groups[seed]))];
const floor = id => bottom.includes(id) ? 'bottom' : 'top';
module.exports = {groups,bottom,ids,colors,sorted,union,floor};
