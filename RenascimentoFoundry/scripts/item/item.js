import { Roll } from "@foundryvtt/dice";

/**
 * Estende a classe base Item para implementar funcionalidades específicas do sistema Renascimento.
 * @extends {Item}
 */
export class RenascimentoItem extends Item {
  
  /** @override */
  prepareData() {
    super.prepareData();
    
    // Obter os dados do item
    const itemData = this;
    const data = itemData.system;
    
    // Preparar dados com base no tipo de item
    if (itemData.type === "arma") this._prepareArmaData(itemData);
    if (itemData.type === "protecao") this._prepareProtecaoData(itemData);
    if (itemData.type === "poder") this._preparePoderData(itemData);
  }
  
  /**
   * Prepara os dados específicos de armas
   * @param {Object} itemData Os dados do item
   * @private
   */
  _prepareArmaData(itemData) {
    const data = itemData.system;
    // Processamento específico para armas
    
    // Garantir que o dano tenha um formato válido
    if (!data.dano) data.dano = "1d6";
  }
  
  /**
   * Prepara os dados específicos de proteções
   * @param {Object} itemData Os dados do item
   * @private
   */
  _prepareProtecaoData(itemData) {
    const data = itemData.system;
    // Processamento específico para proteções
    
    // Garantir que a defesa seja um número
    if (isNaN(data.defesa)) data.defesa = 0;
  }
  
  /**
   * Prepara os dados específicos de poderes
   * @param {Object} itemData Os dados do item
   * @private
   */
  _preparePoderData(itemData) {
    const data = itemData.system;
    // Processamento específico para poderes
    
    // Garantir que o NEX requisito seja um número
    if (isNaN(data.nexRequisito)) data.nexRequisito = 5;
  }
  
  /**
   * Rola o dano da arma
   * @returns {Promise<Roll>} A rolagem resultante
   */
  async rollDano() {
    if (this.type !== "arma") return;
    
    const formula = this.system.dano;
    const roll = new Roll(formula);
    await roll.evaluate({async: true});
    
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `Dano: ${this.name}`,
      rollMode: game.settings.get("core", "rollMode")
    });
    
    return roll;
  }
  
  /**
   * Verifica se o personagem atende aos requisitos para usar este item
   * @param {Actor} actor O ator a verificar
   * @returns {boolean} Se o ator atende aos requisitos
   */
  podeSerUsadoPor(actor) {
    if (!actor) return false;
    
    // Verificar tipo de item
    if (this.type === "poder") {
      // Verificar NEX requisito
      if (actor.system.nex < this.system.nexRequisito) {
        return false;
      }
      
      // Verificar origem ou trilha, se especificado
      if (this.system.origem && this.system.origem !== actor.system.origem) {
        return false;
      }
      
      if (this.system.trilha && this.system.trilha !== actor.system.trilha) {
        return false;
      }
    }
    
    // Verificar patente para equipamentos
    if (["arma", "protecao", "item"].includes(this.type)) {
      const patentes = ["Recruta", "Operador", "Agente Especial", "Veterano"];
      const patenteItem = this.system.patente;
      const patenteAtor = actor.system.patente;
      
      const indexItem = patentes.indexOf(patenteItem);
      const indexAtor = patentes.indexOf(patenteAtor);
      
      if (indexItem > indexAtor) {
        return false;
      }
    }
    
    return true;
  }
}