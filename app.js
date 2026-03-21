(function () {
  const STORAGE_KEY = "dosSantosMarketData";
  const SESSION_KEY = "dosSantosAdminAuthenticated";

  const defaultData = {
    client: {
      storeName: "Do Santos Market",
      responsibleName: "",
      phone: "",
      email: "",
      document: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      description:
        "Dados da empresa, atendimento e informações principais podem ser atualizados pelo painel administrativo.",
      adminPassword: "dosantos123",
    },
    mercadopago: {
      enabled: false,
      publicKey: "",
      accessToken: "",
      pixKey: "",
      webhookUrl: "",
      notes: "",
      webhookJson: {
        evento: "payment.updated",
        origem: "mercado_pago",
        url: "https://seu-dominio.com/webhook",
        ativo: true,
      },
    },
    paymentMethods: [
      { id: "pm-1", name: "Cartão de crédito", details: "Até 4x sem juros", active: true },
      { id: "pm-2", name: "PIX", details: "Pagamento à vista", active: true },
    ],
    deliveryMethods: [
      { id: "dm-1", name: "Entrega expressa", deadline: "10 dias útil", price: 25, regions: "Capital e região metropolitana" },
    ],
    categories: [
      {
        id: "cat-1",
        name: "Moda Feminina",
        subcategories: [
          { id: "sub-1", name: "Vestidos" },
          { id: "sub-2", name: "Bolsas" },
          { id: "sub-3", name: "Relógios" },
        ],
      },
      {
        id: "cat-2",
        name: "Masculino",
        subcategories: [
          { id: "sub-4", name: "Camisas" },
          { id: "sub-5", name: "Sapatos" },
        ],
      },
    ],
    products: [
      {
        id: "prd-1",
        sku: "MOD-0001",
        name: "Sandália linha dourada",
        categoryId: "cat-1",
        subcategoryId: "sub-2",
        costValue: 120,
        marginPercent: 58.25,
        saleValue: 189.9,
        supplier: "Fornecedor Premium",
        description: "Seleção premium para campanhas em destaque.",
      },
      {
        id: "prd-2",
        sku: "MOD-0002",
        name: "Bolsa premium em couro",
        categoryId: "cat-1",
        subcategoryId: "sub-2",
        costValue: 160,
        marginPercent: 56.19,
        saleValue: 249.9,
        supplier: "Fornecedor Luxo",
        description: "Área limpa de produto para sua grade de catálogo.",
      },
      {
        id: "prd-3",
        sku: "MAS-0001",
        name: "Tênis urbano moderno",
        categoryId: "cat-2",
        subcategoryId: "sub-5",
        costValue: 95,
        marginPercent: 68.32,
        saleValue: 159.9,
        supplier: "Fornecedor Street",
        description: "Ideal para promoções sazonais de grande impacto.",
      },
    ],
  };

  function cloneDefaultData() {
    return JSON.parse(JSON.stringify(defaultData));
  }

  function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      const seeded = cloneDefaultData();
      saveData(seeded);
      return seeded;
    }

    try {
      const parsed = JSON.parse(raw);
      return {
        ...cloneDefaultData(),
        ...parsed,
        client: { ...cloneDefaultData().client, ...(parsed.client || {}) },
        mercadopago: { ...cloneDefaultData().mercadopago, ...(parsed.mercadopago || {}) },
        paymentMethods: Array.isArray(parsed.paymentMethods) ? parsed.paymentMethods : cloneDefaultData().paymentMethods,
        deliveryMethods: Array.isArray(parsed.deliveryMethods) ? parsed.deliveryMethods : cloneDefaultData().deliveryMethods,
        categories: Array.isArray(parsed.categories) ? parsed.categories : cloneDefaultData().categories,
        products: Array.isArray(parsed.products) ? parsed.products : cloneDefaultData().products,
      };
    } catch (error) {
      console.error("Erro ao carregar dados do painel:", error);
      const seeded = cloneDefaultData();
      saveData(seeded);
      return seeded;
    }
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function currencyBRL(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatJson(value) {
    return JSON.stringify(value, null, 2);
  }

  function getCategoryById(data, categoryId) {
    return data.categories.find((category) => category.id === categoryId);
  }

  function getSubcategoryById(category, subcategoryId) {
    return (category?.subcategories || []).find((subcategory) => subcategory.id === subcategoryId);
  }

  function slugCode(value) {
    return (value || "GEN")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(0, 3)
      .toUpperCase()
      .padEnd(3, "X");
  }

  function generateSku(data, categoryId) {
    const category = getCategoryById(data, categoryId);
    const prefix = slugCode(category?.name || "GER");
    const totalFromPrefix = data.products.filter((product) => product.sku.startsWith(prefix)).length + 1;
    return `${prefix}-${String(totalFromPrefix).padStart(4, "0")}`;
  }

  function calculateSaleValue(costValue, marginPercent) {
    const cost = Number(costValue || 0);
    const margin = Number(marginPercent || 0);
    return Number((cost * (1 + margin / 100)).toFixed(2));
  }

  function createEl(tag, className, text) {
    const element = document.createElement(tag);
    if (className) {
      element.className = className;
    }
    if (typeof text === "string") {
      element.textContent = text;
    }
    return element;
  }

  function renderSite(data) {
    renderCategoryNav(data);
    renderTrendingSearches(data);
    renderMiniCategories(data);
    renderCollectionGrid(data);
    renderProductGrid(data);
    renderStoreInfo(data);
    renderBrandPills(data);
  }

  function renderCategoryNav(data) {
    const nav = document.getElementById("categoryNav");
    if (!nav) return;

    nav.innerHTML = "";

    data.categories.slice(0, 8).forEach((category) => {
      const link = createEl("a", "", category.name);
      link.href = "#collections";
      nav.appendChild(link);
    });
  }

  function renderTrendingSearches(data) {
    const container = document.getElementById("trendingSearches");
    if (!container) return;

    container.innerHTML = "";
    container.appendChild(createEl("span", "", "Em alta agora:"));

    const items = [];

    data.categories.forEach((category) => {
      items.push(category.name);
      category.subcategories.forEach((subcategory) => items.push(subcategory.name));
    });

    items.slice(0, 6).forEach((item) => {
      const link = createEl("a", "", item);
      link.href = "#collections";
      container.appendChild(link);
    });
  }

  function renderMiniCategories(data) {
    const container = document.getElementById("miniCategories");
    if (!container) return;

    container.innerHTML = "";

    const categories = data.categories.slice(0, 6);

    categories.forEach((category) => {
      const card = createEl("article", "mini-category-card");
      card.appendChild(createEl("span", "", category.name));
      card.appendChild(createEl("strong", "", category.subcategories[0]?.name || "Linha principal"));
      container.appendChild(card);
    });
  }

  function renderCollectionGrid(data) {
    const container = document.getElementById("collectionGrid");
    if (!container) return;

    container.innerHTML = "";

    data.categories.slice(0, 4).forEach((category) => {
      const card = createEl("article", "collection-card");
      card.appendChild(createEl("span", "", category.name));
      card.appendChild(
        createEl(
          "h3",
          "",
          category.subcategories.length
            ? `Subcategorias: ${category.subcategories.map((item) => item.name).join(", ")}`
            : "Categoria pronta para receber produtos."
        )
      );
      container.appendChild(card);
    });
  }

  function renderProductGrid(data) {
    const container = document.getElementById("productGrid");
    if (!container) return;

    container.innerHTML = "";

    if (!data.products.length) {
      const emptyCard = createEl("article", "product-card");
      emptyCard.appendChild(createEl("span", "product-badge", "Sem produtos"));
      emptyCard.appendChild(createEl("div", "product-thumb"));
      emptyCard.appendChild(createEl("h3", "", "Nenhum produto cadastrado"));
      emptyCard.appendChild(createEl("p", "", "Cadastre os produtos no painel admin para exibir aqui."));
      emptyCard.appendChild(createEl("strong", "", "R$ 0,00"));
      container.appendChild(emptyCard);
      return;
    }

    data.products.slice(0, 8).forEach((product, index) => {
      const category = getCategoryById(data, product.categoryId);
      const subcategory = getSubcategoryById(category, product.subcategoryId);
      const card = createEl("article", "product-card");
      const badgeText = index === 0 ? "Novo" : subcategory?.name || "Produto";

      card.appendChild(createEl("span", "product-badge", badgeText));
      card.appendChild(createEl("div", "product-thumb"));
      card.appendChild(createEl("h3", "", product.name));
      card.appendChild(createEl("p", "", product.description || "Produto cadastrado pelo painel administrativo."));
      card.appendChild(createEl("strong", "", currencyBRL(product.saleValue)));
      container.appendChild(card);
    });
  }

  function renderStoreInfo(data) {
    const clientCard = document.getElementById("clientDataCard");
    const paymentCard = document.getElementById("paymentMethodsCard");
    const deliveryCard = document.getElementById("deliveryMethodsCard");
    const footerDescription = document.getElementById("footerClientDescription");

    if (clientCard) {
      clientCard.innerHTML = `
        <span>Dados do cliente</span>
        <h3>${data.client.storeName || "Do Santos Market"}</h3>
        <p>${[data.client.responsibleName, data.client.phone, data.client.email].filter(Boolean).join(" | ") || "Cadastre telefone, e-mail e responsável no painel admin."}</p>
      `;
    }

    if (paymentCard) {
      const activeMethods = data.paymentMethods.filter((item) => item.active);
      paymentCard.innerHTML = `
        <span>Pagamentos</span>
        <h3>${activeMethods.length ? activeMethods[0].name : "Formas de pagamento"}</h3>
        <p>${activeMethods.map((item) => `${item.name}: ${item.details}`).join(" | ") || "Configure parcelamentos, PIX, cartão, boleto e regras comerciais."}</p>
      `;
    }

    if (deliveryCard) {
      deliveryCard.innerHTML = `
        <span>Entregas</span>
        <h3>${data.deliveryMethods[0]?.name || "Métodos de entrega"}</h3>
        <p>${data.deliveryMethods.map((item) => `${item.name}: ${item.deadline}`).join(" | ") || "Cadastre regiões atendidas, valores e prazos de envio."}</p>
      `;
    }

    if (footerDescription) {
      footerDescription.textContent = data.client.description || cloneDefaultData().client.description;
    }
  }

  function renderWebhookPreview(data) {
    const preview = document.getElementById("webhookJsonPreview");
    if (!preview) return;
    preview.textContent = formatJson(data.mercadopago.webhookJson || {});
  }

  function renderBrandPills(data) {
    const container = document.getElementById("brandPillRow");
    if (!container) return;

    container.innerHTML = "";
    const names = data.categories.map((category) => category.name).slice(0, 5);

    names.forEach((name) => {
      container.appendChild(createEl("div", "brand-pill", name));
    });
  }

  function requireAdminAccess(data) {
    const overlay = document.getElementById("adminLoginOverlay");
    const shell = document.getElementById("adminShell");
    const form = document.getElementById("adminLoginForm");
    const errorLabel = document.getElementById("adminLoginError");
    const logoutButton = document.getElementById("logoutButton");

    if (!overlay || !shell || !form || !errorLabel || !logoutButton) return;

    if (sessionStorage.getItem(SESSION_KEY) === "true") {
      overlay.classList.add("hidden");
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.elements.namedItem("adminPassword");
      const password = input ? input.value : "";

      if (password === data.client.adminPassword) {
        sessionStorage.setItem(SESSION_KEY, "true");
        overlay.classList.add("hidden");
        errorLabel.textContent = "";
        form.reset();
      } else {
        errorLabel.textContent = "Senha inválida.";
      }
    });

    logoutButton.addEventListener("click", () => {
      sessionStorage.removeItem(SESSION_KEY);
      overlay.classList.remove("hidden");
    });
  }

  function setupAdmin(data) {
    requireAdminAccess(data);
    setupClientForm(data);
    setupMercadoPagoForm(data);
    setupPaymentMethodForm(data);
    setupDeliveryMethodForm(data);
    setupCategoryForm(data);
    setupProductForm(data);
    renderAdminTables(data);
    renderSummary(data);
    renderWebhookPreview(data);
  }

  function setupClientForm(data) {
    const form = document.getElementById("clientForm");
    if (!form) return;

    Object.entries(data.client).forEach(([key, value]) => {
      const field = form.elements.namedItem(key);
      if (field) {
        field.value = value || "";
      }
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      data.client = {
        ...data.client,
        storeName: form.elements.storeName.value.trim(),
        responsibleName: form.elements.responsibleName.value.trim(),
        phone: form.elements.phone.value.trim(),
        email: form.elements.email.value.trim(),
        document: form.elements.document.value.trim(),
        address: form.elements.address.value.trim(),
        city: form.elements.city.value.trim(),
        state: form.elements.state.value.trim(),
        zipCode: form.elements.zipCode.value.trim(),
        description: form.elements.description.value.trim(),
        adminPassword: form.elements.adminPassword.value.trim() || data.client.adminPassword,
      };

      form.elements.adminPassword.value = data.client.adminPassword;
      saveData(data);
      renderSite(data);
      renderSummary(data);
      console.log("Dados do cliente atualizados:", data.client);
      alert("Dados do cliente salvos com sucesso.");
    });
  }

  function setupMercadoPagoForm(data) {
    const form = document.getElementById("mercadoPagoForm");
    if (!form) return;

    form.elements.enabled.value = String(data.mercadopago.enabled);
    form.elements.publicKey.value = data.mercadopago.publicKey;
    form.elements.accessToken.value = data.mercadopago.accessToken;
    form.elements.pixKey.value = data.mercadopago.pixKey;
    form.elements.webhookUrl.value = data.mercadopago.webhookUrl;
    form.elements.notes.value = data.mercadopago.notes;
    form.elements.webhookJson.value = formatJson(data.mercadopago.webhookJson || {});

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      let parsedWebhookJson = {};

      try {
        parsedWebhookJson = JSON.parse(form.elements.webhookJson.value || "{}");
      } catch (error) {
        console.error("JSON de webhook inválido:", error);
        alert("O JSON do webhook está inválido. Revise o conteúdo antes de salvar.");
        return;
      }

      data.mercadopago = {
        enabled: form.elements.enabled.value === "true",
        publicKey: form.elements.publicKey.value.trim(),
        accessToken: form.elements.accessToken.value.trim(),
        pixKey: form.elements.pixKey.value.trim(),
        webhookUrl: form.elements.webhookUrl.value.trim(),
        notes: form.elements.notes.value.trim(),
        webhookJson: parsedWebhookJson,
      };

      saveData(data);
      form.elements.webhookJson.value = formatJson(data.mercadopago.webhookJson || {});
      renderWebhookPreview(data);
      console.log("Configuração do Mercado Pago atualizada:", data.mercadopago);
      alert("Configuração do Mercado Pago salva com sucesso.");
    });
  }

  function setupPaymentMethodForm(data) {
    const form = document.getElementById("paymentMethodForm");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      data.paymentMethods.push({
        id: `pm-${Date.now()}`,
        name: form.elements.name.value.trim(),
        details: form.elements.details.value.trim(),
        active: form.elements.active.value === "true",
      });

      saveData(data);
      renderAdminTables(data);
      renderSite(data);
      renderSummary(data);
      console.log("Forma de pagamento adicionada:", data.paymentMethods[data.paymentMethods.length - 1]);
      form.reset();
    });
  }

  function setupDeliveryMethodForm(data) {
    const form = document.getElementById("deliveryMethodForm");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      data.deliveryMethods.push({
        id: `dm-${Date.now()}`,
        name: form.elements.name.value.trim(),
        deadline: form.elements.deadline.value.trim(),
        price: Number(form.elements.price.value || 0),
        regions: form.elements.regions.value.trim(),
      });

      saveData(data);
      renderAdminTables(data);
      renderSite(data);
      renderSummary(data);
      console.log("Método de entrega adicionado:", data.deliveryMethods[data.deliveryMethods.length - 1]);
      form.reset();
    });
  }

  function setupCategoryForm(data) {
    const form = document.getElementById("categoryForm");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const categoryId = `cat-${Date.now()}`;
      const subcategories = form.elements.subcategories.value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((name, index) => ({
          id: `sub-${Date.now()}-${index}`,
          name,
        }));

      data.categories.push({
        id: categoryId,
        name: form.elements.name.value.trim(),
        subcategories,
      });

      saveData(data);
      renderAdminTables(data);
      updateProductCategoryOptions(data);
      renderSite(data);
      renderSummary(data);
      console.log("Categoria adicionada:", data.categories[data.categories.length - 1]);
      form.reset();
    });
  }

  function setupProductForm(data) {
    const form = document.getElementById("productForm");
    if (!form) return;

    const categorySelect = document.getElementById("productCategorySelect");
    const subcategorySelect = document.getElementById("productSubcategorySelect");
    const cancelEditButton = document.getElementById("cancelProductEditButton");

    function resetProductForm() {
      form.reset();
      form.elements.editingProductId.value = "";
      updateProductCategoryOptions(data);
      refreshSubcategoryOptions(data, categorySelect.value);
      refreshSkuPreview();
    }

    function refreshSkuPreview() {
      const categoryId = categorySelect.value;
      if (form.elements.editingProductId.value) {
        const editingProduct = data.products.find((item) => item.id === form.elements.editingProductId.value);
        form.elements.sku.value = editingProduct?.sku || "";
        return;
      }

      form.elements.sku.value = categoryId ? generateSku(data, categoryId) : "";
    }

    function syncSaleValue() {
      const saleValue = calculateSaleValue(form.elements.costValue.value, form.elements.marginPercent.value);
      form.elements.saleValue.value = saleValue ? String(saleValue) : "";
    }

    updateProductCategoryOptions(data);
    refreshSubcategoryOptions(data, categorySelect.value);
    refreshSkuPreview();

    categorySelect.addEventListener("change", () => {
      refreshSubcategoryOptions(data, categorySelect.value);
      refreshSkuPreview();
    });

    form.elements.costValue.addEventListener("input", syncSaleValue);
    form.elements.marginPercent.addEventListener("input", syncSaleValue);

    cancelEditButton.addEventListener("click", () => {
      resetProductForm();
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const categoryId = form.elements.categoryId.value;
      const editingProductId = form.elements.editingProductId.value;
      const existingProduct = data.products.find((item) => item.id === editingProductId);
      const product = {
        id: existingProduct?.id || `prd-${Date.now()}`,
        sku: existingProduct?.sku || generateSku(data, categoryId),
        name: form.elements.name.value.trim(),
        categoryId,
        subcategoryId: form.elements.subcategoryId.value,
        costValue: Number(form.elements.costValue.value || 0),
        marginPercent: Number(form.elements.marginPercent.value || 0),
        saleValue: Number(form.elements.saleValue.value || 0),
        supplier: form.elements.supplier.value.trim(),
        description: form.elements.description.value.trim(),
      };

      if (existingProduct) {
        data.products = data.products.map((item) => (item.id === existingProduct.id ? product : item));
      } else {
        data.products.push(product);
      }

      saveData(data);
      renderAdminTables(data);
      renderSite(data);
      renderSummary(data);
      console.log("Produto salvo:", product);
      resetProductForm();
    });
  }

  function updateProductCategoryOptions(data) {
    const categorySelect = document.getElementById("productCategorySelect");
    if (!categorySelect) return;

    categorySelect.innerHTML = "";

    data.categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  }

  function refreshSubcategoryOptions(data, categoryId) {
    const subcategorySelect = document.getElementById("productSubcategorySelect");
    if (!subcategorySelect) return;

    subcategorySelect.innerHTML = "";

    const category = getCategoryById(data, categoryId) || data.categories[0];
    (category?.subcategories || []).forEach((subcategory) => {
      const option = document.createElement("option");
      option.value = subcategory.id;
      option.textContent = subcategory.name;
      subcategorySelect.appendChild(option);
    });
  }

  function renderAdminTables(data) {
    renderPaymentMethodsTable(data);
    renderDeliveryMethodsTable(data);
    renderCategoryTable(data);
    renderProductTable(data);
  }

  function renderPaymentMethodsTable(data) {
    const tbody = document.getElementById("paymentMethodTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    data.paymentMethods.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.details}</td>
        <td>${item.active ? "Ativo" : "Inativo"}</td>
        <td><button type="button" class="danger-button" data-remove-payment="${item.id}">Excluir</button></td>
      `;
      tbody.appendChild(row);
    });

    tbody.querySelectorAll("[data-remove-payment]").forEach((button) => {
      button.addEventListener("click", () => {
        data.paymentMethods = data.paymentMethods.filter((item) => item.id !== button.dataset.removePayment);
        saveData(data);
        renderAdminTables(data);
        renderSite(data);
        renderSummary(data);
      });
    });
  }

  function renderDeliveryMethodsTable(data) {
    const tbody = document.getElementById("deliveryMethodTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    data.deliveryMethods.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.deadline}</td>
        <td>${currencyBRL(item.price)}</td>
        <td>${item.regions}</td>
        <td><button type="button" class="danger-button" data-remove-delivery="${item.id}">Excluir</button></td>
      `;
      tbody.appendChild(row);
    });

    tbody.querySelectorAll("[data-remove-delivery]").forEach((button) => {
      button.addEventListener("click", () => {
        data.deliveryMethods = data.deliveryMethods.filter((item) => item.id !== button.dataset.removeDelivery);
        saveData(data);
        renderAdminTables(data);
        renderSite(data);
        renderSummary(data);
      });
    });
  }

  function renderCategoryTable(data) {
    const tbody = document.getElementById("categoryTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    data.categories.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.subcategories.map((subcategory) => subcategory.name).join(", ")}</td>
        <td><button type="button" class="danger-button" data-remove-category="${item.id}">Excluir</button></td>
      `;
      tbody.appendChild(row);
    });

    tbody.querySelectorAll("[data-remove-category]").forEach((button) => {
      button.addEventListener("click", () => {
        const categoryId = button.dataset.removeCategory;
        data.categories = data.categories.filter((item) => item.id !== categoryId);
        data.products = data.products.filter((product) => product.categoryId !== categoryId);
        saveData(data);
        renderAdminTables(data);
        updateProductCategoryOptions(data);
        refreshSubcategoryOptions(data, document.getElementById("productCategorySelect")?.value);
        renderSite(data);
        renderSummary(data);
      });
    });
  }

  function renderProductTable(data) {
    const tbody = document.getElementById("productTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    data.products.forEach((item) => {
      const category = getCategoryById(data, item.categoryId);
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.sku}</td>
        <td>${item.name}</td>
        <td>${category?.name || "Sem categoria"}</td>
        <td>${currencyBRL(item.costValue)}</td>
        <td>${item.marginPercent}%</td>
        <td>${currencyBRL(item.saleValue)}</td>
        <td>${item.supplier}</td>
        <td>
          <button type="button" class="secondary-button table-button" data-edit-product="${item.id}">Editar</button>
          <button type="button" class="danger-button table-button" data-remove-product="${item.id}">Excluir</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    tbody.querySelectorAll("[data-edit-product]").forEach((button) => {
      button.addEventListener("click", () => {
        const product = data.products.find((item) => item.id === button.dataset.editProduct);
        const form = document.getElementById("productForm");

        if (!product || !form) return;

        form.elements.editingProductId.value = product.id;
        form.elements.name.value = product.name;
        form.elements.categoryId.value = product.categoryId;
        refreshSubcategoryOptions(data, product.categoryId);
        form.elements.subcategoryId.value = product.subcategoryId;
        form.elements.costValue.value = String(product.costValue);
        form.elements.marginPercent.value = String(product.marginPercent);
        form.elements.saleValue.value = String(product.saleValue);
        form.elements.supplier.value = product.supplier;
        form.elements.description.value = product.description || "";
        form.elements.sku.value = product.sku;
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    tbody.querySelectorAll("[data-remove-product]").forEach((button) => {
      button.addEventListener("click", () => {
        data.products = data.products.filter((item) => item.id !== button.dataset.removeProduct);
        saveData(data);
        renderAdminTables(data);
        renderSite(data);
        renderSummary(data);
      });
    });
  }

  function renderSummary(data) {
    const summaryProducts = document.getElementById("summaryProducts");
    const summaryCategories = document.getElementById("summaryCategories");
    const summaryPayments = document.getElementById("summaryPayments");
    const summaryDeliveries = document.getElementById("summaryDeliveries");

    if (summaryProducts) {
      summaryProducts.textContent = String(data.products.length);
    }

    if (summaryCategories) {
      summaryCategories.textContent = String(data.categories.length);
    }

    if (summaryPayments) {
      summaryPayments.textContent = String(data.paymentMethods.filter((item) => item.active).length);
    }

    if (summaryDeliveries) {
      summaryDeliveries.textContent = String(data.deliveryMethods.length);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;
    const data = loadData();

    if (page === "site") {
      renderSite(data);
    }

    if (page === "admin") {
      setupAdmin(data);
    }
  });
})();
