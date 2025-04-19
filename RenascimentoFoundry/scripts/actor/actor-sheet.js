import { ActorSheet } from "@system/sheet/base-sheet";
import { mergeObject } from "@foundryVTT-utils";
import { DEFAULT_TOKEN } from "@scripts/constants";
import { $ } from "@utils";
import { ui } from "@client";

/**
 * Folha de personagem para o sistema Renascimento
 * @extends {ActorSheet}
 */
export class RenascimentoActorSheet extends ActorSheet {
  
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["renascimento", "sheet", "actor"],
      template: "systems/renascimento/templates/actor/character-sheet.html",
      width: 800,
      height: 700,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "principal" }]
    });
  }
  
  /** @override */
  get template() {
    const path = "systems/renascimento/templates/actor";
    return `${path}/${this.actor.type}-sheet.html`;
  }
  
  /** @override */
  getData() {
    const context = super.getData();
    const actorData = this.actor.toObject(false);
    
    // Adicionar dados do ator ao contexto
    context.system = actorData.system;
    context.flags = actorData.flags;
    
    // Adicionar dados do ator
    context.actor = actorData;
    context.data = actorData.system;
    
    // Preparar itens
    this._prepareItems(context);
    
    // Adicionar opções para rolagens
    context.rollData = this.actor.getRollData();
    
    return context;
  }
  
  /**
   * Organiza e classifica os itens para exibição na ficha
   * @param {Object} context Os dados da ficha
   * @private
   */
  _prepareItems(context) {
    // Inicializar containers
    const armas = [];
    const protecoes = [];
    const itens = [];
    const poderes = [];
    const origem = [];
    const trilha = [];
    
    // Organizar itens por tipo
    for (let i of context.actor.items) {
      i.img = i.img || DEFAULT_TOKEN;
      
      if (i.type === "arma") {
        armas.push(i);
      } else if (i.type === "protecao") {
        protecoes.push(i);
      } else if (i.type === "item") {
        itens.push(i);
      } else if (i.type === "poder") {
        poderes.push(i);
      } else if (i.type === "origem") {
        origem.push(i);
      } else if (i.type === "trilha") {
        trilha.push(i);
      }
    }
    
    // Ordenar itens alfabeticamente
    armas.sort((a, b) => a.name.localeCompare(b.name));
    protecoes.sort((a, b) => a.name.localeCompare(b.name));
    itens.sort((a, b) => a.name.localeCompare(b.name));
    poderes.sort((a, b) => a.name.localeCompare(b.name));
    
    // Atribuir aos dados da ficha
    context.armas = armas;
    context.protecoes = protecoes;
    context.itens = itens;
    context.poderes = poderes;
    context.origem = origem;
    context.trilha = trilha;
  }
  
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    
    // Funcionalidades para proprietários da ficha
    if (this.actor.isOwner) {
      // Rolagem de atributos
      html.find('.atributo-roll').click(this._onRollAtributo.bind(this));
      
      // Rolagem de perícias
      html.find('.pericia-roll').click(this._onRollPericia.bind(this));
      
      // Rolagem de dano
      html.find('.roll-dano').click(this._onRollDano.bind(this));
      
      // Edição de itens
      html.find('.item-edit').click(ev => {
        const li = $(ev.currentTarget).parents(".item");
        const item = this.actor.items.get(li.data("itemId"));
        item.sheet.render(true);
      });
      
      // Criação de itens
      html.find('.item-create').click(this._onItemCreate.bind(this));
      
      // Exclusão de itens
      html.find('.item-delete').click(ev => {
        const li = $(ev.currentTarget).parents(".item");
        const item = this.actor.items.get(li.data("itemId"));
        item.delete();
        li.slideUp(200, () => this.render(false));
      });
      
      // Alternar treinamento de perícias
      html.find('.pericia-treinamento').click(this._onToggleTreinamento.bind(this));
      
      // Atualizar atributos
      html.find('.atributo-valor input').change(this._onUpdateAtributo.bind(this));
    }
    
    // Funcionalidades para todos os usuários
    html.find('.item-name').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });
  }
  
  /**
   * Manipula a rolagem de atributos
   * @param {Event} event O evento de clique
   * @private
   */
  _onRollAtributo(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const atributo = element.dataset.atributo;
    this.actor.rollAtributo(atributo);
  }
  
  /**
   * Manipula a rolagem de perícias
   * @param {Event} event O evento de clique
   * @private
   */
  _onRollPericia(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const pericia = element.dataset.pericia;
    this.actor.rollPericia(pericia);
  }
  
  /**
   * Manipula a rolagem de dano
   * @param {Event} event O evento de clique
   * @private
   */
  _onRollDano(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const formula = element.dataset.formula;
    const label = element.dataset.label;
    this.actor.rollDano(formula, label);
  }
  
  /**
   * Manipula a criação de novos itens
   * @param {Event} event O evento de clique
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    
    const itemData = {
      name: `Novo ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type: type,
      system: {}
    };
    
    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }
  
  /**
   * Manipula a alteração do nível de treinamento de perícias
   * @param {Event} event O evento de clique
   * @private
   */
  _onToggleTreinamento(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const pericia = element.dataset.pericia;
    const periciaData = this.actor.system.pericias[pericia];
    
    // Ciclo: 0 (destreinado) -> 5 (treinado) -> 10 (expert) -> 0
    let novoTreinamento = 0;
    if (periciaData.treinamento === 0) novoTreinamento = 5;
    else if (periciaData.treinamento === 5) novoTreinamento = 10;
    
    // Verificar se há graus suficientes
    const grausRestantes = this.actor.system.grausTreinamento.restantes;
    const custoGraus = novoTreinamento === 5 ? 1 : (novoTreinamento === 10 ? 2 : 0);
    
    if (novoTreinamento > periciaData.treinamento && custoGraus > grausRestantes) {
      ui.notifications.warn("Não há graus de treinamento suficientes disponíveis.");
      return;
    }
    
    // Atualizar treinamento
    this.actor.update({
      [`system.pericias.${pericia}.treinamento`]: novoTreinamento
    });
  }
  
  /**
   * Manipula a atualização de atributos
   * @param {Event} event O evento de mudança
   * @private
   */
  _onUpdateAtributo(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const atributo = element.name.split('.')[2];
    const valorAtual = this.actor.system.atributos[atributo].valor;
    const novoValor = parseInt(element.value);
    
    // Verificar se há pontos suficientes
    const pontosRestantes = this.actor.system.pontosAtributo.restantes;
    const custoPontos = novoValor - valorAtual;
    
    if (custoPontos > 0 && custoPontos > pontosRestantes) {
      ui.notifications.warn("Não há pontos de atributo suficientes disponíveis.");
      element.value = valorAtual;
      return;
    }
    
    // Verificar limites
    if (novoValor < 0) {
      ui.notifications.warn("O valor do atributo não pode ser menor que 0.");
      element.value = valorAtual;
      return;
    }
    
    let limiteAtributo = 4;
    if (this.actor.system.nex > 5) {
        limiteAtributo = 5;
    }

    if (novoValor > limiteAtributo) {
      ui.notifications.warn(`O valor máximo para atributos no NEX ${this.actor.system.nex}% é ${limiteAtributo}.`);
      element.value = valorAtual;
      return;
    }
    
    // Atualizar atributo
    this.actor.update({
      [`system.atributos.${atributo}.valor`]: novoValor
    });
  }
}