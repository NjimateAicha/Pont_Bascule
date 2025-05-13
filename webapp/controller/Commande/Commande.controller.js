sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, JSONModel, MessageBox, MessageToast, History) {
    "use strict";

    return Controller.extend("projectsd.controller.Commande.Commande", {

        onInit: function () {
            var oCommandeModel = new JSONModel({
                Idcommande: "",
                Datecommande: null,
                Quantite: "1",  // Valeur par défaut pour la quantité
                Prixtotal: "",
                Idclient: "",
                Nomclient: "",
                Adresse: "",
                Idarticle: "",
                Nomarticle: "",
                Prixunitaire: ""
            });
            this.getView().setModel(oCommandeModel, "newCommande");

            this._oODataModel = this.getOwnerComponent().getModel();
            this._setupSmartTable();
            const oSmartTable = this.byId("smartTableCommande");
          
            // Attendre que la table réelle soit disponible
            oSmartTable.attachInitialise(() => {
              const oTable = oSmartTable.getTable();
              
              // Si la table est une ResponsiveTable (sap.m.Table), utilise cette méthode
              if (oTable.setMode) {
                oTable.setMode("SingleSelectMaster"); // ou "MultiSelect"
              }
            });
        },

       

        _setupSmartTable: function () {
            var oSmartTable = this.getView().byId("smartTableCommande");
            if (oSmartTable) {
                oSmartTable.setInitiallyVisibleFields("Idcommande,Datecommande,Nomclient,Nomarticle,Prixunitaire,Quantite,Prixtotal,Adresse");
            }
        },

     
        onCancelDialog: function () {  // Nom corrigé pour correspondre à la vue
            this.getView().byId("addCommandeDialog").close();
        },
   
        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteAccueil", {}, true);
            }
        },

        onAddCommandePress: function () {
            var oDialog = this.getView().byId("addCommandeDialog");
        
            this._generateNextCommandeId((sNextId) => {
                var oCommandeModel = this.getView().getModel("newCommande");
             
                oCommandeModel.setData({
                    Idcommande: sNextId,
                    Datecommande: new Date(),
                    Idclient: "",
                    Nomclient: "",
                    Adresse: "",
                    Articles: [
                        {
                            Idarticle: "",
                            Nomarticle: "",
                            Prixunitaire: "",
                            Quantite: "1",
                            Prixtotal: ""
                        }
                    ]
                });
        
                if (oDialog) {
                    this.getView().addDependent(oDialog);
                    oDialog.open();
                }
            });
        },
        


       
        onSaveCommande: function () {
            const oModel = this._oODataModel;
            oModel.setUseBatch(false);
        
            const oCommandeModel = this.getView().getModel("newCommande");
            const oData = oCommandeModel.getData();
            const formattedDate = new Date(oData.Datecommande).toISOString().split("T")[0];
        
          
            if (!oData.Idcommande || !oData.Idclient || !oData.Articles || oData.Articles.length === 0) {
                MessageBox.error("Veuillez remplir la commande et ajouter au moins un article.");
                return;
            }
        
           
            const seen = new Set();
            const duplicates = oData.Articles.some(article => {
                const key = article.Idarticle;
                if (!key) return true; // Cas article vide
                if (seen.has(key)) return true; // Doublon
                seen.add(key);
                return false;
            });
        
            if (duplicates) {
                MessageBox.error("Un ou plusieurs articles sont vides ou dupliqués. Veuillez corriger.");
                return;
            }
        
           
            let inserted = 0;
            const total = oData.Articles.length;
        
            const finish = () => {
                this.getView().byId("addCommandeDialog").close();
                this.byId("smartTableCommande").rebindTable();
                MessageToast.show("Commande enregistrée avec succès.");
            };
        
            oData.Articles.forEach(article => {
                const quantite = parseFloat(article.Quantite || 0);
                const prix = parseFloat(article.Prixunitaire || 0);
                const oEntry = {
                
                    Idcommande: oData.Idcommande,
                    Datecommande: formattedDate,
                    Idclient: oData.Idclient,
                    Nomclient: oData.Nomclient,
                    Adresse: oData.Adresse,
                    Idarticle: article.Idarticle,
                    Nomarticle: article.Nomarticle,
                    Quantite: quantite.toString(),
                    Prixunitaire: prix.toString(),
                    Prixtotal: (quantite * prix).toFixed(2)
                };
                console.log("Article à enregistrer : ", oEntry);

            // 1. Lire l'article
oModel.read("/ZCDS_article('" + article.Idarticle + "')", {
    success: (oArticleData) => {
        const stockDispo = parseFloat(oArticleData.Quantitearticle);

        if (quantite > stockDispo) {
            MessageBox.error("Stock insuffisant pour l'article " + article.Nomarticle + ". Stock dispo : " + stockDispo);
            return;
        }

        // 2. Créer la commande
        oModel.create("/ZCDS_commande", oEntry, {
            success: () => {
                // 3. Mettre à jour le stock
                const newStock = stockDispo - quantite;
                oModel.update("/ZCDS_article('" + article.Idarticle + "')", {
                    Quantitearticle: newStock.toString()
                }, {
                    success: () => {
                        console.log("Stock mis à jour pour article : " + article.Idarticle);
                    },
                    error: () => {
                        MessageToast.show("Commande enregistrée, mais échec de mise à jour du stock.");
                    }
                });

                inserted++;
                if (inserted === total) finish();
            },
            error: () => {
                MessageBox.error("Erreur d’enregistrement d’un article.");
            }
        });
    },
    error: () => {
        MessageBox.error("Impossible de récupérer les infos de l’article : " + article.Idarticle);
    }
});

            });
        }
,         
     
       
        onClientChange: function (oEvent) {
            console.log("onClientChange appelé");
            var oSelectedItem = oEvent.getParameter("selectedItem");
            
            if (!oSelectedItem) {
                console.log("Aucun élément sélectionné");
                return;
            }
            
            var oContext = oSelectedItem.getBindingContext();
            
            if (!oContext) {
                console.log("Pas de contexte de binding");
                return;
            }
            
            var oClientData = oContext.getObject();
            console.log("Données client récupérées:", oClientData);
            
            var oCommandeModel = this.getView().getModel("newCommande");
            oCommandeModel.setProperty("/Idclient", oClientData.Idclient);
            oCommandeModel.setProperty("/Nomclient", oClientData.Nomclient);
            oCommandeModel.setProperty("/Adresse", oClientData.Adresse);
        
        },

      
      
        

      
        _generateNextCommandeId: function (callback) {
            var oModel = this._oODataModel;
        
            
            oModel.read("/ZCDS_commande", {
                success: function (oData) {
                    var aCommandes = oData.results;
                    var maxId = 0;
        
                    aCommandes.forEach(function (commande) {
                        var match = commande.Idcommande.match(/\d+$/); 
                        if (match) {
                            var num = parseInt(match[0], 10);
                            if (num > maxId) {
                                maxId = num;
                            }
                        }
                    });
        
                    
                    var nextId = "C" + String(maxId + 1).padStart(4, '0');
        
                    callback(nextId);
                },
                error: function () {
                    MessageBox.error("Erreur lors de la récupération du dernier ID commande.");
                }
            });
        }
        ,      
        
        onAddArticleLine: function () {

            var oModel = this.getView().getModel("newCommande");
        
            var aArticles = oModel.getProperty("/Articles") || [];
             const existingIds = aArticles.map(a => a.Idarticle);
        
            if (existingIds.includes("")) {
        
                MessageToast.show("Veuillez remplir l'article avant d'en ajouter un autre.");
                 return;
        
            }
            aArticles.push({
                Idarticle: "",
                Nomarticle: "",
                Prixunitaire: 0,
                Quantite: 1
            });
        
        
        
            oModel.setProperty("/Articles", aArticles);
        
        },
          
        
        
          calculateTotalPrix: function () {
            const aArticles = this.getView().getModel("newCommande").getProperty("/Articles") || [];
            let total = 0;
            aArticles.forEach(item => {
                total += parseFloat(item.Prixtotal || 0);
            });
            this.getView().getModel("newCommande").setProperty("/Prixtotal", total.toFixed(2));
        }
        
          ,
          
          
          onQuantiteChange: function (oEvent) {
            const oContext = oEvent.getSource().getBindingContext("newCommande");
            const oArticle = oContext.getObject();
            const oModel = oContext.getModel();
            const sPath = oContext.getPath();
        
            const quantite = parseInt(oArticle.Quantite);
            const stock = parseInt(oArticle.StockDisponible);
            const prix = parseFloat(oArticle.Prixunitaire) || 0;
        
            if (isNaN(quantite) || quantite <= 0) {
                MessageBox.warning("Quantité invalide.");
                oModel.setProperty(sPath + "/Quantite", 1);
            } else if (quantite > stock) {
                MessageBox.warning("Stock insuffisant. Stock dispo: " + stock);
                oModel.setProperty(sPath + "/Quantite", stock);
            }
        
            const finalQuantite = oModel.getProperty(sPath + "/Quantite");
            const total = finalQuantite * prix;
        
            oModel.setProperty(sPath + "/Prixtotal", total);
        
            
            oModel.refresh(true);
        }
        
          ,
          onArticleSelectionChange: function (oEvent) {
            var sSelectedId = oEvent.getSource().getSelectedKey();
            var oCtx = oEvent.getSource().getBindingContext("newCommande");
        
            if (!sSelectedId || !oCtx) return;
        
            var oArticleModel = oCtx.getModel(); // ici = newCommande
            var aArticles = oArticleModel.getProperty("/Articles");
        
            // Vérifie les doublons (dans le modèle newCommande)
            const duplicate = aArticles.filter(a => a.Idarticle === sSelectedId).length > 1;
            if (duplicate) {
                MessageBox.error("Cet article est déjà sélectionné.");
                return;
            }
        
            var sPath = "/ZCDS_article('" + sSelectedId + "')";
            this._oODataModel.read(sPath, {
                success: function (oData) {
                    var oArticlePath = oCtx.getPath();
        
                    oArticleModel.setProperty(oArticlePath + "/Prixunitaire", oData.Prixunitaire);
                    oArticleModel.setProperty(oArticlePath + "/Idarticle", oData.Idarticle);
                    oArticleModel.setProperty(oArticlePath + "/Nomarticle", oData.Nomarticle);
                    oArticleModel.setProperty(oArticlePath + "/StockDisponible", oData.Quantitearticle);
        
                    var quantite = parseFloat(oArticleModel.getProperty(oArticlePath + "/Quantite")) || 1;
                    oArticleModel.setProperty(oArticlePath + "/Prixtotal", quantite * oData.Prixunitaire);
                },
                error: function () {
                    MessageToast.show("Erreur lors du chargement de l’article.");
                }
            });
        }
        
        ,
        onDeleteCommandePress: function () {
            var oSmartTable = this.getView().byId("smartTableCommande");
            var oTable = oSmartTable.getTable();
            var oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageBox.warning("Veuillez sélectionner une commande à supprimer.");
                return;
            }

            var oContext = oSelectedItem.getBindingContext();
            var sPath = oContext.getPath();

            MessageBox.confirm("Voulez-vous supprimer cette commande ?", {
                title: "Confirmation de suppression",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: (sAction) => {
                    if (sAction === MessageBox.Action.YES) {
                        this._oODataModel.remove(sPath, {
                            success: () => {
                                MessageToast.show("Commande supprimée.");
                                oSmartTable.rebindTable();
                            },
                            error: () => {
                                MessageBox.error("Erreur lors de la suppression.");
                            }
                        });
                    }
                }
            });
        }
        ,
        onUpdateCommandePress: function () {
            var oSmartTable = this.getView().byId("smartTableCommande");
            var oTable = oSmartTable.getTable();
            var oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageBox.warning("Veuillez sélectionner une commande à modifier.");
                return;
            }

            var oContext = oSelectedItem.getBindingContext();
            var oData = oContext.getObject();

            this.getView().getModel("newCommande").setData({
                Idcommande: oData.Idcommande,
                Datecommande: oData.Datecommande,
                Idclient: oData.Idclient,
                Nomclient: oData.Nomclient,
                Adresse: oData.Adresse,
                Articles: [
                    {
                        Idarticle: oData.Idarticle,
                        Nomarticle: oData.Nomarticle,
                        Prixunitaire: oData.Prixunitaire,
                        Quantite: oData.Quantite,
                        Prixtotal: oData.Prixtotal
                    }
                ]
            });

            this.getView().byId("addCommandeDialog").open();
        }
  
        
        
          
    });
});