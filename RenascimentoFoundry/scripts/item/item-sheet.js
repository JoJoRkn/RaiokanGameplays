import { ItemSheet } from "@system/sheet/base-item-sheet";

/**
 * Folha de item para o sistema Renascimento
 * @extends {ItemSheet}
 */
export class RenascimentoItemSheet extends ItemSheet {
  
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["renascimento", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "descricao" }]
    });
  }
  
  /** @override */
  get template() {
    const path = "systems/renascimento/templates/item";
    return `${path}/${this.item.type}-sheet.html`;
  }
  
  /** @override */
  getData() {
    const context = super.getData();
    const itemData = this.item.toObject(false);
    
    // Adicionar dados do item ao contexto
    context.system = itemData.system;
    context.flags = itemData.flags;
    
    // Adicionar dados do item
    context.item = itemData;
    context.data = itemData.system;
    
    // Dados específicos por tipo de item
    if (this.item.type === "poder") {
      context.origens = this._getOrigens();
      context.trilhas = this._getTrilhas();
    }
    
    return context;
  }
  
  /**
   * Obtém a lista de origens disponíveis
   * @returns {Array} Lista de origens
   * @private
   */
  _getOrigens() {
    const origens = [
      "Acadêmico", "Agente de Saúde", "Amnésico", "Artista", "Atleta", 
      "Chef", "Criminoso", "Cultista Arrependido", "Desgarrado", "Engenheiro",
      "Investigador", "Lutador", "Magnata", "Religioso", "Soldado",
      "T.I.", "Teórico da Conspiração", "Trabalhador", "Amigo dos Animais",
      "Astronauta", "Explorador", "Legista", "Mergulhador", "Motorista",
      "Psicólogo", "Profetizado", "Feto Paranormal", "Político", "Zero de NEX",
      "Blaster"
    ];
    
    return origens.sort();
  }
  
  /**
   * Obtém a lista de trilhas disponíveis
   * @returns {Array} Lista de trilhas
   * @private
   */
  _getTrilhas() {
    const trilhas = [
      "Aniquilador", "Comandante de Campo", "Multi Trilhas", "Lâmina Paranormal",
      "Exorcista", "Agente Secreto", "Infiltrador", "Guerreiro", "Operações Especiais",
      "Tropa de Choque", "Atirador de Elite", "Médico de Campo", "Negociador",
      "Técnico", "Conduíte", "Flagelador", "Graduado", "Intuitivo", "Caçador",
      "Bibliotecário", "Perseverante", "Muambeiro", "Possuído", "Adestrador",
      "Alquimista", "Ventríloquo"
    ];
    
    return trilhas.sort();
  }
  
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    
    // Funcionalidades para proprietários do item
    if (this.item.isOwner) {
      // Rolagem de dano
      html.find('.roll-dano').click(this._onRollDano.bind(this));
    }
  }
  
  /**
   * Manipula a rolagem de dano
   * @param {Event} event O evento de clique
   * @private
   */
  _onRollDano(event) {
    event.preventDefault();
    this.item.rollDano();
  }
}