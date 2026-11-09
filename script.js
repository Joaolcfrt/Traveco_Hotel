'use strict';

/* TRAVECO — demonstração local. Dados guardados apenas neste navegador. */
const STORAGE = {
  users: 'traveco_users_v2',
  session: 'traveco_session_v2',
  favorites: 'traveco_favorites_v2',
  bookings: 'traveco_bookings_v2',
  reviews: 'traveco_reviews_v2'
};

const HOTELS = [
  {
    id: 'conrad', name: 'Conrad Maldives', rating: 9.6, price: 3656, priceLabel: 'R$ 3.656 a R$ 5.131', location: 'Ilhas Maldivas', rooms: 5, baths: 5, tag: 'Mais popular',
    image: 'assets/conrad-maldives.png', gallery: ['assets/conrad-maldives.png','assets/jade-mountain.png','assets/rayavadee.png'],
    description: 'Um refúgio sobre águas cristalinas, com villas privativas, paisagens tropicais e vistas inesquecíveis do oceano.', amenities: ['Villas sobre a água','Piscina','Restaurante','Wi-Fi','Praia privativa']
  },
  {
    id: 'jade', name: 'Jade Mountain Resort', rating: 9.0, price: 7203, priceLabel: 'R$ 7.203 a R$ 25.850', location: 'Santa Lúcia', rooms: 4, baths: 4, tag: 'Vista panorâmica',
    image: 'assets/jade-mountain.png', gallery: ['assets/jade-mountain.png','assets/conrad-maldives.png','assets/villa-interior.png'],
    description: 'Arquitetura integrada à paisagem tropical, com vistas para as montanhas Pitons e ambientes pensados para o descanso.', amenities: ['Vista para montanhas','Piscina privativa','Restaurante','Wi-Fi','Spa']
  },
  {
    id: 'rayavadee', name: 'Rayavadee', rating: 9.6, price: 2700, priceLabel: 'R$ 2.700 a R$ 19.000', location: 'Krabi, Tailândia', rooms: 4, baths: 3, tag: 'Praia',
    image: 'assets/rayavadee.png', gallery: ['assets/rayavadee.png','assets/conrad-maldives.png','assets/jade-mountain.png'],
    description: 'Resort cercado por jardins tropicais e praias de areia clara na costa de Krabi.', amenities: ['Jardins tropicais','Piscina','Restaurante','Wi-Fi','Acesso à praia']
  },
  {
    id: 'villa', name: 'Villa Amistà Pousada Boutique', rating: 9.5, price: 1256, priceLabel: 'R$ 1.256 / dia', location: 'Campos do Jordão, SP', rooms: 4, baths: 2, tag: 'Em seu país',
    image: 'assets/villa-amista.png', gallery: ['assets/villa-amista.png','assets/villa-interior.png','assets/villa-noite.png'],
    description: '“Amistà” significa amizade no dialeto italiano, inspirando uma proposta de acolhimento e tranquilidade. A pousada ocupa 3.600 m² de jardins e árvores nativas da Serra da Mantiqueira. Fica a poucos minutos a pé do centrinho de Capivari e de atrações locais.', amenities: ['3.600 m² de jardins','Café da manhã','Wi-Fi','Área verde','Perto de Capivari']
  },
  {
    id: 'quinta', name: 'Quinta dos Pinhais Pouso e Charme', rating: 9.0, price: 2295, priceLabel: 'R$ 2.295 / dia', location: 'Serra da Mantiqueira, SP', rooms: 2, baths: 1, tag: 'Em seu país',
    image: 'assets/quinta-pinhais.png', gallery: ['assets/quinta-pinhais.png','assets/villa-amista.png','assets/villa-interior.png'],
    description: 'Hospedagem charmosa cercada pela natureza da Serra da Mantiqueira, ideal para descansar e aproveitar a paisagem.', amenities: ['Natureza','Wi-Fi','Estacionamento','Área externa']
  },
  {
    id: 'vilatoro', name: 'Vilatoro Guest House', rating: 9.9, price: 1200, priceLabel: 'R$ 1.200 / dia', location: 'Brasil', rooms: 2, baths: 1, tag: 'Em seu país',
    image: 'assets/vilatoro.png', gallery: ['assets/vilatoro.png','assets/quinta-pinhais.png','assets/villa-interior.png'],
    description: 'Uma hospedagem acolhedora para descansar, aproveitar a estrutura de lazer e conhecer a região.', amenities: ['Piscina','Área externa','Wi-Fi','Estacionamento']
  }
];

const DEFAULT_REVIEWS = {
  villa: [
    { id: 'seed-villa-1', name: 'Luciene', rating: 10, trip: 'Viagem a dois', date: '25/10/2026', text: 'Hotel excelente. Tudo personalíssimo e acolhedor. Equipe super profissional e simpática. Café da manhã super variado e gostoso.', verified: true },
    { id: 'seed-villa-2', name: 'Denner Willian', rating: 10, trip: 'Viagem a dois', date: '25/10/2026', text: 'Da localização ao Staff, simplesmente incrível, você se sente totalmente em casa! Recomendo.', verified: true }
  ]
};

let currentRoute = 'home';
let selectedHotelId = 'villa';
let pendingBookingId = null;
let authMode = 'login';
let toastTimer = null;
let state = loadState();

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (error) {
    console.warn(`Não foi possível ler ${key}:`, error);
    return fallback;
  }
}
function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Não foi possível salvar ${key}:`, error);
    showToast('Não foi possível salvar. Verifique o espaço disponível no navegador.');
    return false;
  }
}
function loadState() {
  const users = readStorage(STORAGE.users, []);
  const session = readStorage(STORAGE.session, null);
  const favorites = readStorage(STORAGE.favorites, []);
  const bookings = readStorage(STORAGE.bookings, []);
  const reviews = readStorage(STORAGE.reviews, {});
  return {
    users: Array.isArray(users) ? users : [],
    session: session && typeof session === 'object' ? session : null,
    favorites: Array.isArray(favorites) ? favorites : [],
    bookings: Array.isArray(bookings) ? bookings : [],
    reviews: reviews && typeof reviews === 'object' ? reviews : {}
  };
}
function saveState() {
  const a = writeStorage(STORAGE.users, state.users);
  const b = writeStorage(STORAGE.session, state.session);
  const c = writeStorage(STORAGE.favorites, state.favorites);
  const d = writeStorage(STORAGE.bookings, state.bookings);
  const e = writeStorage(STORAGE.reviews, state.reviews);
  return a && b && c && d && e;
}
function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
}
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(value);
}
function formatDate(value) {
  if (!value) return '—';
  const parts = value.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : value;
}
function dateDiff(start, end) {
  const a = new Date(`${start}T12:00:00`);
  const b = new Date(`${end}T12:00:00`);
  return Math.round((b - a) / 86400000);
}
function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
function getHotel(id) { return HOTELS.find(hotel => hotel.id === id) || HOTELS[0]; }
function getReviews(id) {
  const saved = state.reviews[id];
  return Array.isArray(saved) ? saved : (DEFAULT_REVIEWS[id] || []);
}
function getRating(hotel) {
  const customReviews = Array.isArray(state.reviews[hotel.id])
    ? state.reviews[hotel.id].filter(review => !String(review.id).startsWith('seed-'))
    : [];
  if (!customReviews.length) return hotel.rating;
  const scores = [hotel.rating, ...customReviews.map(review => Number(review.rating || 0))];
  return scores.reduce((total, score) => total + score, 0) / scores.length;
}
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3000);
}
function stars(value) {
  const count = Math.max(0, Math.min(5, Math.round(Number(value) / 2)));
  return `<span class="stars" aria-label="${Number(value).toFixed(1)} de 10">${'★'.repeat(count)}${'☆'.repeat(5 - count)}</span>`;
}
function isLoggedIn() {
  return Boolean(state.session && state.users.some(user => user.id === state.session.userId));
}
function currentUser() {
  return isLoggedIn() ? state.users.find(user => user.id === state.session.userId) : null;
}
function requireLogin(message = 'Entre ou crie uma conta para continuar.') {
  if (isLoggedIn()) return true;
  showToast(message);
  authMode = 'login';
  navigate('account');
  return false;
}
function renderNav() {
  document.querySelectorAll('[data-route]').forEach(link => {
    const active = link.dataset.route === currentRoute || (currentRoute === 'detail' && link.dataset.route === 'hotels') || (currentRoute === 'booking' && link.dataset.route === 'bookings') || currentRoute === 'payment' && link.dataset.route === 'bookings';
    link.classList.toggle('active', active);
  });
  const accountNav = document.getElementById('accountNav');
  if (accountNav) {
    const user = currentUser();
    accountNav.querySelector('span').textContent = user ? user.username : 'CONTA';
  }
}
function navigate(route) {
  const allowed = ['home','hotels','detail','booking','payment','bookings','favorites','account'];
  currentRoute = allowed.includes(route) ? route : 'home';
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const nav = document.querySelector('.main-nav');
  const toggle = document.querySelector('.menu-toggle');
  if (nav) nav.classList.remove('open');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
  if (location.hash !== `#${route}`) history.replaceState(null, '', `#${route === 'detail' ? 'hoteis' : route === 'booking' || route === 'payment' ? 'agendamentos' : route === 'home' ? 'inicio' : route === 'hotels' ? 'hoteis' : route}`);
}
function hotelCard(hotel) {
  const favorite = state.favorites.includes(hotel.id);
  return `
    <article class="hotel-card">
      <div class="hotel-image">
        <button class="hotel-image-trigger" type="button" data-action="detail" data-id="${hotel.id}" aria-label="Ver detalhes de ${escapeHTML(hotel.name)}"><img src="${hotel.image}" alt="${escapeHTML(hotel.name)}" loading="lazy"></button>
        <button class="favorite-button ${favorite ? 'is-favorite' : ''}" type="button" data-action="favorite" data-id="${hotel.id}" aria-label="${favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">${favorite ? '♥' : '♡'}</button>
      </div>
      <div class="hotel-info">
        <h3 class="hotel-name">${escapeHTML(hotel.name)}</h3>
        <p class="hotel-location">⌖ ${escapeHTML(hotel.location)}</p>
        <p class="hotel-rating">${stars(getRating(hotel))} &nbsp; ${getRating(hotel).toFixed(1).replace('.', ',')}/10</p>
        <p class="hotel-price">${escapeHTML(hotel.priceLabel)}</p>
        <div class="card-actions"><span class="pill">${escapeHTML(hotel.tag)}</span><button class="text-button" data-action="detail" data-id="${hotel.id}">Ver detalhes →</button></div>
      </div>
    </article>`;
}
function hotelSection(title, list, subtitle = '') {
  return `<section class="section"><div class="section-head"><div><h2>${escapeHTML(title)}</h2>${subtitle ? `<p class="section-subtitle">${escapeHTML(subtitle)}</p>` : ''}</div><button class="text-button" data-action="navigate" data-route="hotels">VER TUDO →</button></div><div class="hotel-grid">${list.map(hotelCard).join('')}</div></section>`;
}
function homePage() {
  return `<div class="container">
    <section class="hero"><div class="hero-copy"><span class="eyebrow">Sua próxima viagem começa aqui</span><h1>Descubra lugares que ficam na memória.</h1><p>Encontre hospedagens especiais e organize sua próxima experiência.</p></div></section>
    <form class="search-panel" id="homeSearch">
      <div class="field"><label for="searchDestination">⌖ LOCAL:</label><input id="searchDestination" name="destination" type="search" placeholder="Para onde você vai?"></div>
      <div class="field"><label for="searchDates">▦ DIA/MÊS:</label><input id="searchDates" name="dates" type="text" placeholder="Ex.: 10/12 a 15/12"></div>
      <div class="field"><label for="searchGuests">♙ HÓSPEDES:</label><select id="searchGuests" name="guests"><option value="2">2 hóspedes</option><option value="1">1 hóspede</option><option value="3">3 hóspedes</option><option value="4">4 hóspedes</option><option value="5">5+ hóspedes</option></select></div>
      <button class="primary-button" type="submit">BUSCAR →</button>
    </form>
    ${hotelSection('MAIS POPULARES:', HOTELS.slice(0,3))}
    ${hotelSection('EM SEU PAÍS:', HOTELS.slice(3))}
    <section class="callout"><div><h3>Planeje sua próxima pausa.</h3><p>Salve seus favoritos, confira comentários e organize suas reservas.</p></div><button class="primary-button" data-action="navigate" data-route="hotels">EXPLORAR HOTÉIS</button></section>
  </div>`;
}
function hotelsPage() {
  return `<div class="container"><div class="page-head"><div><p class="page-kicker">ESCOLHA SUA PRÓXIMA ESTADIA</p><h1>HOTÉIS</h1><p class="section-subtitle">Explore as opções e abra cada hospedagem para ver detalhes e comentários.</p></div><span class="pill">${HOTELS.length} hospedagens</span></div>
    <div class="filter-bar"><input id="hotelSearch" type="search" placeholder="Buscar hotel ou destino..." aria-label="Buscar hotel ou destino"><select id="hotelSort" aria-label="Ordenar hotéis"><option value="recommended">Mais populares</option><option value="price">Menor preço</option><option value="rating">Melhor avaliação</option></select><select id="hotelCountry" aria-label="Filtrar região"><option value="all">Todas as regiões</option><option value="local">Em seu país</option><option value="international">Internacionais</option></select></div>
    <div class="hotel-grid" id="hotelGrid">${HOTELS.map(hotelCard).join('')}</div></div>`;
}
function detailPage() {
  const hotel = getHotel(selectedHotelId);
  const reviews = getReviews(hotel.id).slice().sort((a,b) => String(b.id).localeCompare(String(a.id)));
  const rating = getRating(hotel);
  const gallery = hotel.gallery.map(src => `<img src="${src}" alt="Imagem de ${escapeHTML(hotel.name)}" loading="lazy">`).join('');
  const amenities = hotel.amenities.map(item => `<span class="amenity">${escapeHTML(item)}</span>`).join('');
  return `<div class="container"><button class="text-button" data-action="navigate" data-route="hotels">← VOLTAR PARA HOTÉIS</button>
    <section class="detail-shell"><div class="detail-top"><div><p class="page-kicker">${escapeHTML(hotel.location.toUpperCase())}</p><h1>${escapeHTML(hotel.name)}</h1><div>${stars(rating)} &nbsp; <strong>${rating.toFixed(1).replace('.', ',')}/10</strong> · ${reviews.length} avaliação(ões)</div></div><button class="secondary-button" data-action="favorite" data-id="${hotel.id}">${state.favorites.includes(hotel.id) ? '♥ SALVO' : '♡ FAVORITAR'}</button></div>
      <div class="gallery">${gallery}</div>
      <div class="detail-columns"><div>
        <section class="white-panel"><h2>Sobre esta hospedagem</h2><p class="hotel-description">${escapeHTML(hotel.description)}</p><div class="amenities">${amenities}<span class="amenity">${hotel.rooms} quartos</span><span class="amenity">${hotel.baths} banheiros</span></div></section>
        <section class="white-panel" style="margin-top:18px"><h2>COMENTÁRIOS</h2><div class="rating-summary"><span class="rating-number">${rating.toFixed(1).replace('.', ',')}</span><div>${stars(rating)}<div class="review-meta">Avaliação média demonstrativa</div></div></div>
          <div class="review-list">${reviews.length ? reviews.map(review => `<article class="review-card"><div class="review-heading"><div><div class="review-name">${escapeHTML(review.name)}</div><div class="review-meta">${escapeHTML(review.trip || 'Hospedagem')} · ${escapeHTML(review.date || '')}</div></div><strong>${Number(review.rating).toFixed(1).replace('.', ',')}/10</strong></div><div>${stars(review.rating)}</div><p>${escapeHTML(review.text)}</p>${review.verified ? '<div class="review-meta">✓ Avaliação de demonstração</div>' : '<div class="review-meta">Comentário publicado neste navegador</div>'}</article>`).join('') : '<p class="muted">Ainda não há comentários. Seja a primeira pessoa a avaliar esta hospedagem.</p>'}</div>
          <form class="review-form" id="reviewForm" data-hotel="${hotel.id}"><h3>Deixe seu comentário</h3><p class="review-meta">Compartilhe sua experiência com outros viajantes.</p><div class="form-grid"><div class="form-field"><label for="reviewRating">SUA NOTA (0 A 10)</label><select id="reviewRating" required><option value="">Selecione</option>${[10,9,8,7,6,5,4,3,2,1,0].map(n=>`<option value="${n}">${n}/10</option>`).join('')}</select></div><div class="form-field"><label for="reviewTrip">TIPO DE VIAGEM</label><select id="reviewTrip"><option>Viagem a dois</option><option>Família</option><option>Viagem com amigos</option><option>Viagem individual</option><option>Viagem a trabalho</option></select></div><div class="form-field full"><label for="reviewText">SEU COMENTÁRIO</label><textarea id="reviewText" minlength="8" maxlength="800" required placeholder="Conte o que achou da hospedagem..."></textarea></div></div><button class="primary-button" type="submit">PUBLICAR COMENTÁRIO</button></form>
        </section>
      </div>
      <aside class="white-panel detail-aside"><p class="page-kicker">A PARTIR DE</p><div class="booking-price">${formatCurrency(hotel.price)}</div><p class="muted" style="font:12px var(--sans)">Preço de referência por diária. Valor demonstrativo, sujeito às datas.</p><div class="summary-line"><span>Quartos</span><strong>${hotel.rooms}</strong></div><div class="summary-line"><span>Banheiros</span><strong>${hotel.baths}</strong></div><div class="summary-line"><span>Avaliação</span><strong>${rating.toFixed(1).replace('.', ',')}/10</strong></div><button class="primary-button" style="width:100%;margin-top:17px" data-action="start-booking" data-id="${hotel.id}">AGENDAR</button></aside></div>
    </section></div>`;
}
function bookingPage() {
  const hotel = getHotel(selectedHotelId);
  const today = todayISO();
  return `<div class="container"><div class="page-head"><div><p class="page-kicker">TRAVECO · AGENDAR</p><h1>DIAS DISPONÍVEIS</h1></div></div><div class="booking-layout"><section class="white-panel"><h2>Dados da hospedagem</h2><p class="muted" style="font:13px var(--sans)">Selecione o período e a quantidade de hóspedes.</p><form id="bookingForm"><div class="form-grid"><div class="form-field"><label for="checkin">DIA / CHECK-IN</label><input id="checkin" type="date" min="${today}" required></div><div class="form-field"><label for="checkout">ATÉ / CHECK-OUT</label><input id="checkout" type="date" min="${today}" required></div><div class="form-field"><label for="bookingGuests">HÓSPEDES</label><select id="bookingGuests"><option value="1">1 hóspede</option><option value="2" selected>2 hóspedes</option><option value="3">3 hóspedes</option><option value="4">4 hóspedes</option><option value="5">5 hóspedes</option><option value="6">6 hóspedes</option></select></div><div class="form-field"><label for="bookingNote">OBSERVAÇÕES</label><input id="bookingNote" maxlength="180" placeholder="Opcional"></div></div><div class="notice">Este é um agendamento fictício para demonstração. Nenhuma reserva será enviada ao hotel.</div><button class="primary-button" type="submit">CONTINUAR PARA PAGAMENTO</button></form></section>
    <aside class="white-panel"><img src="${hotel.image}" alt="${escapeHTML(hotel.name)}" style="width:100%;height:180px;object-fit:cover;border:1px solid #111;border-radius:15px"><h2 style="margin-top:15px">${escapeHTML(hotel.name)}</h2><p class="muted" style="font:13px var(--sans)">⌖ ${escapeHTML(hotel.location)}</p><div class="summary-line"><span>Valor por diária</span><strong>${formatCurrency(hotel.price)}</strong></div><div class="summary-line"><span>Quartos / banheiros</span><strong>${hotel.rooms} / ${hotel.baths}</strong></div><p class="muted" style="font:11px/1.5 var(--sans)">O valor total será calculado após a escolha das datas.</p></aside></div></div>`;
}
function bookingTotal(booking) {
  const hotel = getHotel(booking.hotelId);
  const nights = Math.max(1, dateDiff(booking.checkin, booking.checkout));
  return { nights, total: nights * hotel.price, hotel };
}
function paymentPage() {
  const booking = state.bookings.find(item => item.id === pendingBookingId);
  if (!booking) return `<div class="container"><div class="empty-state"><h2>Agendamento não encontrado</h2><button class="primary-button" data-action="navigate" data-route="bookings">VER AGENDAMENTOS</button></div></div>`;
  const { nights, total, hotel } = bookingTotal(booking);
  return `<div class="container"><div class="page-head"><div><p class="page-kicker">TRAVECO · PAGAMENTO</p><h1>FORMA DE PAGAMENTO</h1></div></div><div class="booking-layout"><section class="white-panel"><h2>Escolha como deseja pagar</h2><div class="payment-methods" role="radiogroup" aria-label="Forma de pagamento"><div class="payment-option"><input type="radio" id="methodCredit" name="paymentMethod" value="credit" checked><label for="methodCredit">💳 CRÉDITO</label></div><div class="payment-option"><input type="radio" id="methodDebit" name="paymentMethod" value="debit"><label for="methodDebit">💳 DÉBITO</label></div><div class="payment-option"><input type="radio" id="methodPix" name="paymentMethod" value="pix"><label for="methodPix">▦ PIX</label></div></div>
    <div id="paymentFields">${cardPaymentFields()}</div><div class="notice">Pagamento totalmente fictício: este protótipo não se conecta a bancos, operadoras ou sistemas Pix e não movimenta dinheiro real. Use somente dados de teste.</div><button class="primary-button" id="payButton" type="button">PAGAR ${formatCurrency(total)}</button> <button class="text-button" data-action="pay-later" data-id="${booking.id}">PAGAR APÓS A ESTADIA</button></section>
    <aside class="white-panel"><h2>Resumo do agendamento</h2><img src="${hotel.image}" alt="${escapeHTML(hotel.name)}" style="width:100%;height:160px;object-fit:cover;border:1px solid #111;border-radius:14px"><h3 style="margin-top:13px">${escapeHTML(hotel.name)}</h3><div class="summary-line"><span>Entrada</span><strong>${formatDate(booking.checkin)}</strong></div><div class="summary-line"><span>Saída</span><strong>${formatDate(booking.checkout)}</strong></div><div class="summary-line"><span>Hóspedes</span><strong>${booking.guests}</strong></div><div class="summary-line"><span>Diárias</span><strong>${nights}</strong></div><div class="summary-line"><span>Valor por diária</span><strong>${formatCurrency(hotel.price)}</strong></div><div class="summary-line"><strong>TOTAL</strong><strong>${formatCurrency(total)}</strong></div></aside></div></div>`;
}
function cardPaymentFields() {
  return `<div class="card-grid"><div class="form-field full"><label for="cardName">NOME IMPRESSO NO CARTÃO</label><input id="cardName" autocomplete="cc-name" maxlength="70" placeholder="NOME COMPLETO"></div><div class="form-field full"><label for="cardNumber">NÚMERO DO CARTÃO (TESTE)</label><input id="cardNumber" inputmode="numeric" autocomplete="cc-number" maxlength="23" placeholder="0000 0000 0000 0000"></div><div class="form-field"><label for="cardExpiry">VALIDADE (MM/AA)</label><input id="cardExpiry" inputmode="numeric" autocomplete="cc-exp" maxlength="5" placeholder="MM/AA"></div><div class="form-field"><label for="cardCvv">CVV</label><input id="cardCvv" inputmode="numeric" autocomplete="cc-csc" maxlength="4" placeholder="123"></div></div><p class="review-meta">Cartão de teste aceito: 4242 4242 4242 4242 · Validade futura · CVV 123</p>`;
}
function pixPaymentFields(booking) {
  const pixCode = `00020126580014BR.GOV.BCB.PIX0136TRAVECO-DEMO-${booking.id}5204000053039865802BR5913TRAVECO TESTE6009BRASILIA62070503***6304ABCD`;
  return `<div class="pix-box"><strong>PIX FICTÍCIO — NÃO PAGÁVEL</strong><div class="pix-symbol" aria-label="Ilustração de QR code de demonstração"><span>PIX TESTE</span></div><p>Este código é apenas ilustrativo e não será reconhecido por aplicativos bancários.</p><div id="pixCode">${escapeHTML(pixCode)}</div><button class="secondary-button small" type="button" data-action="copy-pix">COPIAR CÓDIGO DEMONSTRATIVO</button></div>`;
}
function renderPaymentFields() {
  const booking = state.bookings.find(item => item.id === pendingBookingId);
  const fields = document.getElementById('paymentFields');
  if (!booking || !fields) return;
  const method = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'credit';
  fields.innerHTML = method === 'pix' ? pixPaymentFields(booking) : cardPaymentFields();
}
function bookingsPage() {
  const own = state.bookings.filter(item => currentUser() ? item.userId === currentUser().id : false).sort((a,b) => b.createdAt - a.createdAt);
  if (!own.length) return `<div class="container"><div class="page-head"><div><p class="page-kicker">SUA CONTA</p><h1>AGENDAMENTOS</h1></div><button class="primary-button" data-action="navigate" data-route="hotels">＋ NOVA HOSPEDAGEM</button></div><div class="empty-state"><h2>Você ainda não tem agendamentos</h2><p>Quando fizer um agendamento, ele aparecerá aqui.</p><button class="primary-button" data-action="navigate" data-route="hotels">ENCONTRAR HOSPEDAGEM</button></div></div>`;
  return `<div class="container"><div class="page-head"><div><p class="page-kicker">SUA CONTA</p><h1>AGENDAMENTOS</h1></div><button class="primary-button" data-action="navigate" data-route="hotels">＋ NOVA HOSPEDAGEM</button></div>${own.map(item => {
    const { hotel, nights, total } = bookingTotal(item);
    const cancelled = item.status === 'Cancelado';
    const paid = item.status === 'Pago (simulação)';
    const statusClass = cancelled ? 'cancelled' : paid ? 'paid' : '';
    return `<article class="booking-row"><img src="${hotel.image}" alt="${escapeHTML(hotel.name)}"><div><h3>${escapeHTML(hotel.name)}</h3><div class="booking-meta">${formatDate(item.checkin)} até ${formatDate(item.checkout)} · ${item.guests} hóspede(s)<br>${nights} diária(s) · ${formatCurrency(total)}</div><p><span class="status ${statusClass}">${escapeHTML(item.status)}</span></p>${item.refundStatus ? `<div class="booking-meta">${escapeHTML(item.refundStatus)}</div>` : ''}${item.paymentMethod ? `<div class="booking-meta">Pagamento: ${escapeHTML(item.paymentMethod)}</div>` : ''}</div><div class="booking-actions">${!cancelled && !paid ? `<button class="primary-button small" data-action="pay-booking" data-id="${item.id}">PAGAR</button>` : ''}${!cancelled ? `<button class="danger-button small" data-action="cancel-booking" data-id="${item.id}">CANCELAR</button>` : '<span class="muted">Reserva encerrada</span>'}</div></article>`;
  }).join('')}</div>`;
}
function favoritesPage() {
  const list = HOTELS.filter(hotel => state.favorites.includes(hotel.id));
  return `<div class="container"><div class="page-head"><div><p class="page-kicker">HOSPEDAGENS SALVAS</p><h1>FAVORITOS</h1></div></div>${list.length ? `<div class="hotel-grid">${list.map(hotelCard).join('')}</div>` : `<div class="empty-state"><h2>Seus favoritos aparecem aqui</h2><p>Toque no coração de uma hospedagem para guardá-la nesta conta/navegador.</p><button class="primary-button" data-action="navigate" data-route="hotels">EXPLORAR HOTÉIS</button></div>`}</div>`;
}
function accountPage() {
  const user = currentUser();
  if (user) {
    const count = state.bookings.filter(item => item.userId === user.id).length;
    return `<div class="container"><div class="page-head"><div><p class="page-kicker">ÁREA DO CLIENTE</p><h1>MINHA CONTA</h1></div></div><section class="auth-panel"><div class="account-card"><div class="avatar">${escapeHTML(user.username.slice(0,1).toUpperCase())}</div><div><h2 style="margin:0;font:800 25px var(--serif)">${escapeHTML(user.username)}</h2><p class="muted" style="margin:4px 0;font:13px var(--sans)">${escapeHTML(user.email)}</p></div></div><div class="summary-line"><span>Agendamentos</span><strong>${count}</strong></div><div class="summary-line"><span>Favoritos</span><strong>${state.favorites.length}</strong></div><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px"><button class="primary-button" data-action="navigate" data-route="bookings">MEUS AGENDAMENTOS</button><button class="secondary-button" data-action="logout">SAIR DA CONTA</button></div><p class="notice">Os dados deste protótipo ficam salvos somente no armazenamento local deste navegador e dispositivo.</p></section></div>`;
  }
  return `<div class="container"><div class="page-head"><div><p class="page-kicker">TRAVECO · CONTA</p><h1>LOGIN / REGISTRO</h1></div></div><div class="auth-layout"><section class="auth-intro"><h2>Bem-vindo ao TRAVECO</h2><p>Entre com sua conta para guardar favoritos, publicar avaliações e acompanhar seus agendamentos.</p><p>Você também pode continuar explorando como visitante. Para reservar, comentar ou salvar dados em uma conta, será necessário se cadastrar.</p><button class="primary-button" data-action="guest">CONTINUAR COMO CONVIDADO →</button></section><section class="auth-panel"><div class="auth-tabs"><button type="button" class="${authMode === 'login' ? 'active' : ''}" data-action="auth-mode" data-mode="login">ENTRAR</button><button type="button" class="${authMode === 'register' ? 'active' : ''}" data-action="auth-mode" data-mode="register">CADASTRAR</button></div>${authMode === 'login' ? loginForm() : registerForm()}</section></div></div>`;
}
function loginForm() {
  return `<form id="loginForm"><div class="form-field"><label for="loginIdentity">E-MAIL OU USUÁRIO</label><input id="loginIdentity" autocomplete="username" required maxlength="100" placeholder="Seu e-mail ou usuário"></div><div class="form-field"><label for="loginPassword">SENHA</label><input id="loginPassword" type="password" autocomplete="current-password" required minlength="6" maxlength="100" placeholder="Sua senha"></div><button class="primary-button" style="width:100%;margin-top:9px" type="submit">CONTINUAR</button><p class="review-meta">Ainda não tem conta? <button class="inline-link" type="button" data-action="auth-mode" data-mode="register">Cadastre-se</button>.</p><p class="review-meta">Protótipo local: a conta não é válida em outros dispositivos.</p></form>`;
}
function registerForm() {
  return `<form id="registerForm"><div class="form-field"><label for="registerUsername">USUÁRIO</label><input id="registerUsername" autocomplete="username" required minlength="3" maxlength="24" pattern="[A-Za-z0-9_.-]+" title="Use de 3 a 24 letras, números, ponto, hífen ou sublinhado." placeholder="Escolha um usuário"></div><div class="form-field"><label for="registerEmail">E-MAIL</label><input id="registerEmail" type="email" autocomplete="email" required maxlength="100" placeholder="voce@email.com"></div><div class="form-field"><label for="registerPassword">SENHA</label><input id="registerPassword" type="password" autocomplete="new-password" required minlength="6" maxlength="100" placeholder="Mínimo de 6 caracteres"></div><div class="form-field"><label for="registerConfirm">CONFIRMAR SENHA</label><input id="registerConfirm" type="password" autocomplete="new-password" required minlength="6" maxlength="100" placeholder="Digite novamente"></div><button class="primary-button" style="width:100%;margin-top:9px" type="submit">CRIAR CONTA</button><p class="review-meta">Ao criar uma conta, você concorda com os termos e a política de privacidade demonstrativos.</p></form>`;
}
function render() {
  const app = document.getElementById('app');
  if (!app) return;
  const pages = {
    home: homePage,
    hotels: hotelsPage,
    detail: detailPage,
    booking: bookingPage,
    payment: paymentPage,
    bookings: bookingsPage,
    favorites: favoritesPage,
    account: accountPage
  };
  app.innerHTML = (pages[currentRoute] || homePage)();
  if (document.body && document.body.classList) document.body.classList.toggle('pink-page', currentRoute === 'detail');
  renderNav();
}
function toggleFavorite(id) {
  if (!requireLogin('Entre na sua conta para salvar hospedagens nos favoritos.')) return;
  if (state.favorites.includes(id)) {
    state.favorites = state.favorites.filter(item => item !== id);
    showToast('Hospedagem removida dos favoritos.');
  } else {
    state.favorites.push(id);
    showToast('Hospedagem salva nos favoritos.');
  }
  saveState();
  render();
}
function startBooking(id) {
  if (!requireLogin('Entre ou cadastre-se para agendar uma hospedagem.')) return;
  selectedHotelId = id;
  navigate('booking');
}
function createBooking(form) {
  if (!requireLogin()) return;
  const checkin = form.querySelector('#checkin').value;
  const checkout = form.querySelector('#checkout').value;
  const guests = Number(form.querySelector('#bookingGuests').value);
  const note = form.querySelector('#bookingNote').value.trim();
  const today = todayISO();
  if (!checkin || !checkout) { showToast('Informe as datas de entrada e saída.'); return; }
  if (checkin < today) { showToast('A data de entrada não pode estar no passado.'); return; }
  if (checkout <= checkin) { showToast('A saída deve acontecer depois da entrada.'); return; }
  const booking = {
    id: `TRV-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
    userId: currentUser().id,
    hotelId: selectedHotelId,
    checkin,
    checkout,
    guests,
    note,
    status: 'Aguardando pagamento',
    paymentMethod: '',
    createdAt: Date.now()
  };
  state.bookings.push(booking);
  if (!saveState()) return;
  pendingBookingId = booking.id;
  navigate('payment');
}
function luhnCheck(value) {
  const digits = String(value).replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let doubleDigit = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (doubleDigit) { digit *= 2; if (digit > 9) digit -= 9; }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}
function validateCard() {
  const name = document.getElementById('cardName')?.value.trim() || '';
  const number = document.getElementById('cardNumber')?.value || '';
  const expiry = document.getElementById('cardExpiry')?.value.trim() || '';
  const cvv = document.getElementById('cardCvv')?.value.trim() || '';
  if (name.length < 3) return 'Informe o nome impresso no cartão.';
  if (!luhnCheck(number)) return 'Número de cartão inválido. Use o cartão de teste 4242 4242 4242 4242.';
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return 'Informe a validade no formato MM/AA.';
  const [month, year] = expiry.split('/').map(Number);
  if (month < 1 || month > 12) return 'Mês de validade inválido.';
  const now = new Date();
  const currentMonth = now.getFullYear() * 12 + now.getMonth();
  const expiryMonth = (2000 + year) * 12 + (month - 1);
  if (expiryMonth < currentMonth) return 'Este cartão está vencido.';
  if (!/^\d{3,4}$/.test(cvv)) return 'O CVV deve conter 3 ou 4 números.';
  return '';
}
function finishPayment(booking, method) {
  const found = state.bookings.find(item => item.id === booking.id);
  if (!found) { showToast('Não foi possível localizar o agendamento.'); return; }
  found.status = 'Pago (simulação)';
  found.paymentMethod = method;
  found.paidAt = new Date().toISOString();
  found.transactionId = `DEMO-${Date.now().toString(36).toUpperCase()}`;
  if (!saveState()) return;
  showToast('Pagamento fictício aprovado!');
  pendingBookingId = null;
  navigate('bookings');
}
function payCurrentBooking() {
  const booking = state.bookings.find(item => item.id === pendingBookingId);
  if (!booking) { showToast('Agendamento não encontrado.'); return; }
  const method = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'credit';
  const labels = { credit: 'Cartão de crédito (simulação)', debit: 'Cartão de débito (simulação)', pix: 'Pix (simulação)' };
  if (method === 'pix') {
    finishPayment(booking, labels.pix);
    return;
  }
  const validation = validateCard();
  if (validation) { showToast(validation); return; }
  finishPayment(booking, labels[method]);
}
function payLater(id) {
  const booking = state.bookings.find(item => item.id === id);
  if (!booking) return;
  booking.status = 'Aguardando pagamento após a estadia';
  booking.paymentMethod = 'Pagamento após a estadia';
  saveState();
  showToast('Pagamento programado para depois da estadia (demonstração).');
  pendingBookingId = null;
  navigate('bookings');
}
function cancelBooking(id) {
  const booking = state.bookings.find(item => item.id === id);
  if (!booking || booking.status === 'Cancelado') return;
  const refund = booking.status === 'Pago (simulação)';
  const message = refund ? 'Cancelar este agendamento? O reembolso será marcado como simulado.' : 'Deseja cancelar este agendamento?';
  if (!window.confirm(message)) return;
  booking.status = 'Cancelado';
  booking.cancelledAt = new Date().toISOString();
  if (refund) booking.refundStatus = 'Reembolso fictício previsto em até 3 dias';
  saveState();
  showToast(refund ? 'Cancelado. Reembolso fictício registrado.' : 'Agendamento cancelado.');
  render();
}
function addReview(form) {
  if (!requireLogin('Entre na sua conta para publicar um comentário.')) return;
  const hotelId = form.dataset.hotel;
  const rating = Number(form.querySelector('#reviewRating').value);
  const trip = form.querySelector('#reviewTrip').value;
  const text = form.querySelector('#reviewText').value.trim();
  if (!Number.isInteger(rating) || rating < 0 || rating > 10) { showToast('Selecione uma nota válida de 0 a 10.'); return; }
  if (text.length < 8) { showToast('Escreva um comentário com pelo menos 8 caracteres.'); return; }
  const review = {
    id: `REV-${Date.now()}`,
    name: currentUser().username,
    rating,
    trip,
    date: new Intl.DateTimeFormat('pt-BR').format(new Date()),
    text,
    verified: false
  };
  if (!state.reviews[hotelId]) state.reviews[hotelId] = [...(DEFAULT_REVIEWS[hotelId] || [])];
  state.reviews[hotelId].push(review);
  saveState();
  showToast('Comentário publicado com sucesso.');
  render();
}
async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  if (window.crypto && window.crypto.subtle) {
    const hash = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
  }
  // Fallback de demonstração para navegadores sem Web Crypto; não é adequado para produção.
  let hash = 2166136261;
  for (let i = 0; i < password.length; i += 1) { hash ^= password.charCodeAt(i); hash = Math.imul(hash, 16777619); }
  return `demo-${(hash >>> 0).toString(16)}`;
}
async function register(form) {
  const username = form.querySelector('#registerUsername').value.trim();
  const email = form.querySelector('#registerEmail').value.trim().toLowerCase();
  const password = form.querySelector('#registerPassword').value;
  const confirm = form.querySelector('#registerConfirm').value;
  if (!/^[A-Za-z0-9_.-]{3,24}$/.test(username)) { showToast('O usuário deve ter de 3 a 24 caracteres: letras, números, ponto, hífen ou _.'); return; }
  if (password.length < 6) { showToast('A senha deve ter pelo menos 6 caracteres.'); return; }
  if (password !== confirm) { showToast('As senhas não conferem.'); return; }
  if (state.users.some(user => user.email === email)) { showToast('Este e-mail já possui cadastro.'); return; }
  if (state.users.some(user => user.username.toLowerCase() === username.toLowerCase())) { showToast('Este nome de usuário já está em uso.'); return; }
  const user = { id: `USR-${Date.now()}`, username, email, passwordHash: await hashPassword(password), createdAt: Date.now() };
  state.users.push(user);
  state.session = { userId: user.id };
  saveState();
  showToast('Conta criada com sucesso!');
  navigate('account');
}
async function login(form) {
  const identity = form.querySelector('#loginIdentity').value.trim().toLowerCase();
  const password = form.querySelector('#loginPassword').value;
  const hash = await hashPassword(password);
  const user = state.users.find(item => item.email.toLowerCase() === identity || item.username.toLowerCase() === identity);
  if (!user || user.passwordHash !== hash) { showToast('Usuário/e-mail ou senha incorretos.'); return; }
  state.session = { userId: user.id };
  saveState();
  showToast(`Bem-vindo(a), ${user.username}!`);
  navigate('account');
}
function logout() {
  state.session = null;
  saveState();
  showToast('Você saiu da sua conta.');
  navigate('home');
}
function openModal(title, html) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalContent').innerHTML = html;
  document.getElementById('modalBackdrop').hidden = false;
}
function closeModal() {
  document.getElementById('modalBackdrop').hidden = true;
  document.getElementById('modalContent').innerHTML = '';
}
function copyPix() {
  const code = document.getElementById('pixCode')?.textContent || '';
  if (!code) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(() => showToast('Código demonstrativo copiado.')).catch(() => showToast('Não foi possível copiar automaticamente.'));
  } else {
    const area = document.createElement('textarea'); area.value = code; document.body.appendChild(area); area.select();
    try { document.execCommand('copy'); showToast('Código demonstrativo copiado.'); } catch (error) { showToast('Copie o código manualmente.'); }
    area.remove();
  }
}
function handleSearch(form) {
  const query = form.querySelector('#searchDestination').value.trim();
  navigate('hotels');
  const input = document.getElementById('hotelSearch');
  if (input) { input.value = query; filterHotels(); }
}
function filterHotels() {
  const grid = document.getElementById('hotelGrid');
  if (!grid) return;
  const query = (document.getElementById('hotelSearch')?.value || '').trim().toLocaleLowerCase('pt-BR');
  const sort = document.getElementById('hotelSort')?.value || 'recommended';
  const region = document.getElementById('hotelCountry')?.value || 'all';
  let list = HOTELS.filter(hotel => {
    const text = `${hotel.name} ${hotel.location}`.toLocaleLowerCase('pt-BR');
    const matchQuery = text.includes(query);
    const local = ['villa','quinta','vilatoro'].includes(hotel.id);
    const matchRegion = region === 'all' || (region === 'local' ? local : !local);
    return matchQuery && matchRegion;
  });
  if (sort === 'price') list.sort((a,b) => a.price - b.price);
  if (sort === 'rating') list.sort((a,b) => getRating(b) - getRating(a));
  grid.innerHTML = list.length ? list.map(hotelCard).join('') : '<div class="empty-state" style="grid-column:1/-1"><h2>Nenhuma hospedagem encontrada</h2><p>Tente outro nome ou destino.</p></div>';
}
function showPolicy(type) {
  const title = type === 'terms' ? 'Termos e condições' : 'Política de privacidade';
  const body = type === 'terms'
    ? '<p>Este site é um protótipo acadêmico/demonstrativo. Hotéis, preços, disponibilidade, reservas e pagamentos exibidos não constituem oferta comercial nem reserva real.</p><p>Ao utilizar a demonstração, você concorda em inserir somente dados fictícios. Nenhuma transação financeira é realizada.</p>'
    : '<p>As informações de demonstração são guardadas no armazenamento local do navegador utilizado. Elas não são enviadas a um servidor por este protótipo.</p><p>Não informe senhas reais, dados bancários verdadeiros ou informações pessoais sensíveis. Limpar os dados do navegador pode apagar os registros locais.</p>';
  openModal(title, body);
}

// Eventos delegados: os elementos das páginas podem ser recriados sem perder os listeners.
document.addEventListener('click', event => {
  const menuToggle = event.target.closest('.menu-toggle');
  if (menuToggle) {
    const nav = document.querySelector('.main-nav');
    const open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    return;
  }
  const close = event.target.closest('.modal-close');
  if (close || event.target.id === 'modalBackdrop') { closeModal(); return; }
  const routeLink = event.target.closest('[data-route]');
  if (routeLink) { event.preventDefault(); navigate(routeLink.dataset.route); return; }
  const actionEl = event.target.closest('[data-action]');
  if (!actionEl) return;
  const { action, id, route, mode } = actionEl.dataset;
  if (action === 'navigate') navigate(route);
  if (action === 'detail') { selectedHotelId = id; navigate('detail'); }
  if (action === 'favorite') toggleFavorite(id);
  if (action === 'start-booking') startBooking(id);
  if (action === 'auth-mode') { authMode = mode === 'register' ? 'register' : 'login'; render(); }
  if (action === 'logout') logout();
  if (action === 'guest') { navigate('home'); showToast('Você está navegando como visitante.'); }
  if (action === 'pay-booking') { pendingBookingId = id; navigate('payment'); }
  if (action === 'cancel-booking') cancelBooking(id);
  if (action === 'pay-later') payLater(id);
  if (action === 'copy-pix') copyPix();
  if (action === 'terms' || action === 'privacy') showPolicy(action);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeModal();
});

document.addEventListener('submit', event => {
  const form = event.target;
  if (form.id === 'homeSearch') { event.preventDefault(); handleSearch(form); }
  if (form.id === 'bookingForm') { event.preventDefault(); createBooking(form); }
  if (form.id === 'reviewForm') { event.preventDefault(); addReview(form); }
  if (form.id === 'registerForm') { event.preventDefault(); register(form).catch(error => { console.error(error); showToast('Não foi possível criar a conta. Tente novamente.'); }); }
  if (form.id === 'loginForm') { event.preventDefault(); login(form).catch(error => { console.error(error); showToast('Não foi possível entrar. Tente novamente.'); }); }
});

document.addEventListener('input', event => {
  if (event.target.matches('#hotelSearch')) filterHotels();
  if (event.target.id === 'cardNumber') {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 19);
    event.target.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  }
  if (event.target.id === 'cardExpiry') {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 4);
    event.target.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  }
  if (event.target.id === 'cardCvv') event.target.value = event.target.value.replace(/\D/g, '').slice(0, 4);
});

document.addEventListener('change', event => {
  if (event.target.matches('#hotelSort,#hotelCountry')) filterHotels();
  if (event.target.matches('input[name="paymentMethod"]')) renderPaymentFields();
  if (event.target.id === 'checkin') {
    const checkout = document.getElementById('checkout');
    if (checkout) { checkout.min = event.target.value; if (checkout.value && checkout.value <= event.target.value) checkout.value = ''; }
  }
});

document.addEventListener('click', event => {
  if (event.target.id === 'payButton') payCurrentBooking();
});

function init() {
  const validUserIds = new Set(state.users.map(user => user.id));
  if (state.session && !validUserIds.has(state.session.userId)) state.session = null;
  const hash = location.hash.replace('#', '');
  const map = { inicio:'home', hoteis:'hotels', agendamentos:'bookings', favoritos:'favorites', conta:'account' };
  if (map[hash]) currentRoute = map[hash];
  render();
}
init();
