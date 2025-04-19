// Importar classes e módulos
import { RenascimentoActor } from "./actor/actor.js";
import { RenascimentoActorSheet } from "./actor/actor-sheet.js";
import { RenascimentoItem } from "./item/item.js";
import { RenascimentoItemSheet } from "./item/item-sheet.js";
import { ItemSheet } from "./item/item-sheet.js"; // Import ItemSheet
import { Handlebars } from './handlebars.js'; // Import Handlebars

// Inicializar sistema
Hooks.once("init", async function() {
  console.log("Renascimento | Inicializando sistema Renascimento RPG");
  
  // Definir classes personalizadas para Actor e Item
  CONFIG.Actor.documentClass = RenascimentoActor;
  CONFIG.Item.documentClass = RenascimentoItem;
  
  // Registrar folhas de personagem
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("renascimento", RenascimentoActorSheet, { 
    types: ["personagem"],
    makeDefault: true,
    label: "Ficha de Personagem Renascimento"
  });
  
  Actors.registerSheet("renascimento", RenascimentoActorSheet, { 
    types: ["npc"],
    makeDefault: true,
    label: "Ficha de NPC Renascimento"
  });
  
  // Registrar folhas de item
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("renascimento", RenascimentoItemSheet, { 
    makeDefault: true,
    label: "Ficha de Item Renascimento"
  });
  
  // Registrar configurações do sistema
  game.settings.register("renascimento", "usarRegrasAvancadas", {
    name: "Usar Regras Avançadas",
    hint: "Ativa regras avançadas do sistema Renascimento",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });
  
  // Registrar helpers do Handlebars
  Handlebars.registerHelper("concat", function() {
    let outStr = "";
    for (let arg in arguments) {
      if (typeof arguments[arg] != "object") {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });
  
  Handlebars.registerHelper("toLowerCase", function(str) {
    return str.toLowerCase();
  });
  
  Handlebars.registerHelper("ifEquals", function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  });
  
  // Pré-carregar templates
  await loadTemplates([
    "systems/renascimento/templates/actor/parts/atributos.html",
    "systems/renascimento/templates/actor/parts/pericias.html",
    "systems/renascimento/templates/actor/parts/recursos.html",
    "systems/renascimento/templates/actor/parts/equipamentos.html",
    "systems/renascimento/templates/actor/parts/poderes.html"
  ]);
});

// Hook para quando o sistema estiver pronto
Hooks.once("ready", function() {
  console.log("Renascimento | Sistema pronto");
});

// Hook para personalizar rolagens de dados
Hooks.on("createChatMessage", (message, options, userId) => {
  if (message.isRoll && message.data.flavor && message.data.flavor.includes("Renascimento")) {
    // Personalizar mensagens de rolagem
    const roll = message.roll;
    
    // Verificar sucesso/falha baseado no sistema Renascimento
    if (roll.total >= 20) {
      message.data.content += `<div class="dice-result success">Sucesso!</div>`;
    } else if (roll.total <= 5) {
      message.data.content += `<div class="dice-result failure">Falha!</div>`;
    }
  }
});

// Adicionar opções de rolagem personalizadas
Hooks.on("renderChatMessage", (app, html, data) => {
  // Personalizar a exibição das mensagens de chat
  html.find(".dice-roll").addClass("renascimento-roll");
});