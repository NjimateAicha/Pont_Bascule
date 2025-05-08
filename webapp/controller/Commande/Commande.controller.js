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
                            Prixtotal: "0"
                        }
                    ]
                });
        
                if (oDialog) {
                    this.getView().addDependent(oDialog);
                    oDialog.open();
                }
            });
        },
        

        onCancelDialog: function () {  // Nom corrigé pour correspondre à la vue
            this.getView().byId("addCommandeDialog").close();
        },
//         onSaveCommande: function () {
//             var oModel = this._oODataModel;
//             var oView = this.getView();
//             var oCommandeModel = oView.getModel("newCommande");
        
//             // Mettre la date du jour dans le modèle JSON "newCommande"
//             var oDate = new Date();
//             var sDateFormatted = oDate.toISOString().split("T")[0]; // format "YYYY-MM-DD"
//             oCommandeModel.setProperty("/Datecommande", sDateFormatted);
        
//             var oData = oCommandeModel.getData(); // on récupère les données du modèle JSON
        
//             // Valider les champs obligatoires
//             if (!oData.Idcommande || !oData.Idclient || !oData.Idarticle) {
//                 MessageBox.error("Champs requis : ID Commande, Client, Article.");
//                 return;
//             }
        
//             // Valider et formater la quantité
//             var quantite = parseFloat(oData.Quantite);
//             if (isNaN(quantite) || quantite <= 0) {
//                 MessageBox.error("Quantité invalide. Veuillez saisir un nombre positif.");
//                 return;
//             }
        
//             // Valider et parser le prix unitaire
//             var prixUnitaire = parseFloat(oData.Prixunitaire);
//             if (isNaN(prixUnitaire) || prixUnitaire < 0) {
//                 MessageBox.error("Prix unitaire invalide.");
//                 return;
//             }
        
//             // Calculer le prix total
//             var prixTotal = (quantite * prixUnitaire).toFixed(3).toString();
        
//             // Construire le payload
//             var oPayload = {
//                 Idcommande: oData.Idcommande,
//                 Datecommande: oData.Datecommande,
//                 Quantite: quantite.toString(),
//                 Prixtotal: prixTotal,
//                 Idclient: oData.Idclient,
//                 Idarticle: oData.Idarticle
//             };
        
//             console.log("Payload being sent:", JSON.stringify(oPayload));
        
//             var self = this;
//             // oModel.create("/ZCDS_commande", oPayload, {
//             //     success: function () {
//             //         MessageToast.show("Commande enregistrée avec succès.");
//             //         self.getView().byId("addCommandeDialog").close();
        
//             //         var oSmartTable = self.getView().byId("smartTableCommande");
//             //         if (oSmartTable) {
//             //             oSmartTable.rebindTable();
//             //         }
//             //     },
//             //     error: function (oError) {
//             //         console.error("Full error object:", oError);
//             //         var sErrorDetails = "Erreur inconnue";
//             //         if (oError.responseText) {
//             //             try {
//             //                 var oErrorResponse = JSON.parse(oError.responseText);
//             //                 sErrorDetails = oErrorResponse.error.message.value || JSON.stringify(oErrorResponse);
//             //             } catch (e) {
//             //                 sErrorDetails = oError.responseText;
//             //             }
//             //         }
//             //         MessageBox.error("Erreur lors de l'enregistrement de la commande: " + sErrorDetails);
//             //     }
//             // });
       
//             // Lire les données de l’article via son ID
// oModel.read("/ZCDS_article('" + oData.Idarticle + "')", {
//     success: function (oArticleData) {
//         var stockDisponible = parseFloat(oArticleData.Quantitearticle);

//         if (quantite > stockDisponible) {
//             MessageBox.error("Stock insuffisant. Quantité en stock : " + stockDisponible);
//             return;
//         }

//         // Stock suffisant, on peut créer la commande
//         oModel.create("/ZCDS_commande", oPayload, {
//             success: function () {
//                 MessageToast.show("Commande enregistrée avec succès.");

//                 // 🔽 Mettre à jour la quantité de l’article
//                 var nouveauStock = stockDisponible - quantite;
//                 var articleUpdatePayload = {
//                     Quantitearticle: nouveauStock.toString()
//                 };

//                 oModel.update("/ZCDS_article('" + oData.Idarticle + "')", articleUpdatePayload, {
//                     success: function () {
//                         MessageToast.show("Stock mis à jour.");
//                     },
//                     error: function () {
//                         MessageBox.error("La commande a été enregistrée, mais la mise à jour du stock a échoué.");
//                     }
//                 });

//                 // Fermer le dialogue et rafraîchir la SmartTable
//                 self.getView().byId("addCommandeDialog").close();
//                 var oSmartTable = self.getView().byId("smartTableCommande");
//                 if (oSmartTable) {
//                     oSmartTable.rebindTable();
//                 }
//             },
//             error: function (oError) {
//                 MessageBox.error("Erreur lors de la création de la commande.");
//             }
//         });
//     },
//     error: function () {
//         MessageBox.error("Impossible de récupérer les informations de l’article.");
//     }
// });

//         },
        
        // Gestionnaire pour le changement de client
       
       
        onSaveCommande: function () {
            const oModel = this._oODataModel;
            const oCommandeModel = this.getView().getModel("newCommande");
            const oData = oCommandeModel.getData();
        
            // Validation de base
            if (!oData.Idcommande || !oData.Idclient || !oData.Articles || oData.Articles.length === 0) {
                MessageBox.error("Veuillez remplir les informations de commande et au moins un article.");
                return;
            }
        
            // Créer un tableau de payloads pour chaque article
            const aPayloads = oData.Articles.map(article => {
                const quantite = parseFloat(article.Quantite) || 0;
                const prix = parseFloat(article.Prixunitaire) || 0;
                const prixtotal = (quantite * prix).toFixed(3).toString();
        
                return {
                    Idcommande: oData.Idcommande,
                    Datecommande: oData.Datecommande,
                    Idclient: oData.Idclient,
                    Idarticle: article.Idarticle,
                    Quantite: quantite.toString(),
                    Prixtotal: prixtotal
                };
            });
        
            console.log("Payload complet :", JSON.stringify(aPayloads));
        
            // Envoi (exemple avec boucle sur OData.create)
            aPayloads.forEach(payload => {
                oModel.create("/ZCDS_commande", payload, {
                    success: () => MessageToast.show("Commande enregistrée !"),
                    error: (oError) => MessageBox.error("Erreur lors de l'enregistrement.")
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

        // // Gestionnaire pour le changement d'article
        // onArticleChange: function (oEvent) {
        //     console.log("onArticleChange appelé");
        //     var oSelectedItem = oEvent.getParameter("selectedItem");
            
        //     if (!oSelectedItem) {
        //         console.log("Aucun élément sélectionné");
        //         return;
        //     }
            
        //     var oContext = oSelectedItem.getBindingContext();
            
        //     if (!oContext) {
        //         console.log("Pas de contexte de binding");
        //         return;
        //     }
            
        //     var oArticleData = oContext.getObject();
        //     console.log("Données article récupérées:", oArticleData);
            
        //     var oCommandeModel = this.getView().getModel("newCommande");
        //     oCommandeModel.setProperty("/Idarticle", oArticleData.Idarticle);
        //     oCommandeModel.setProperty("/Nomarticle", oArticleData.Nomarticle);
        //     oCommandeModel.setProperty("/Prixunitaire", oArticleData.Prixunitaire);
            
        //     // Mise à jour du prix total
        //     var iQuantite = parseInt(oCommandeModel.getProperty("/Quantite"), 10) || 1;
        //     var fPrix = oArticleData.Prixunitaire || 0;
        //     oCommandeModel.setProperty("/Prixtotal", iQuantite * fPrix);
        // },

        // Mise à jour du prix total lors du changement de quantité
        onQuantiteChange: function (oEvent) {
            var iQuantite = parseInt(oEvent.getSource().getValue(), 10);
            var oCommandeModel = this.getView().getModel("newCommande");
            var fPrix = parseFloat(oCommandeModel.getProperty("/Prixunitaire")) || 0;
            
            if (!isNaN(iQuantite) && iQuantite > 0) {
                oCommandeModel.setProperty("/Quantite", iQuantite);
                oCommandeModel.setProperty("/Prixtotal", iQuantite * fPrix);
            } else {
                MessageBox.error("Quantité invalide. Veuillez saisir un nombre positif.");
                // Réinitialiser à 1 par défaut
                oCommandeModel.setProperty("/Quantite", "1");
                oCommandeModel.setProperty("/Prixtotal", 1 * fPrix);
            }
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
        
        onDeleteCommandePress: function () {
            const oSmartTable = this.byId("smartTableCommande");
            const oTable = oSmartTable.getTable();
            const aSelectedItems = oTable.getSelectedItems();
        
            if (!aSelectedItems.length) {
                sap.m.MessageToast.show("Veuillez sélectionner une commande à supprimer.");
                return;
            }
        
            const oSelectedItem = aSelectedItems[0];
            const oContext = oSelectedItem.getBindingContext();
            const sPath = oContext.getPath();
        
            sap.m.MessageBox.confirm("Voulez-vous vraiment supprimer cette commande ?", {
                onClose: function (oAction) {
                    if (oAction === "OK") {
                        oContext.getModel().remove(sPath, {
                            success: function () {
                                sap.m.MessageToast.show("Commande supprimée avec succès.");
                            },
                            error: function () {
                                sap.m.MessageBox.error("Erreur lors de la suppression de la commande.");
                            }
                        });
                    }
                }
            });
        },
        _generateNextCommandeId: function (callback) {
            var oModel = this._oODataModel;
        
            // Assure-toi que c’est bien le nom correct de l’EntitySet exposé (ex: ZCommandeSet)
            oModel.read("/ZCDS_commande", {
                success: function (oData) {
                    var aCommandes = oData.results;
                    var maxId = 0;
        
                    aCommandes.forEach(function (commande) {
                        var match = commande.Idcommande.match(/\d+$/); // Exemple: extrait "0004" de "C0004"
                        if (match) {
                            var num = parseInt(match[0], 10);
                            if (num > maxId) {
                                maxId = num;
                            }
                        }
                    });
        
                    // Génère le nouvel ID avec format C0001, C0002, etc.
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
              total += (item.Quantite * item.Prixunitaire);
            });
            this.getView().getModel("newCommande").setProperty("/Prixtotal", total);
          }
          ,
          
          onQuantiteChange: function (oEvent) {
            const oContext = oEvent.getSource().getBindingContext("newCommande");
            const oData = oContext.getObject();
            if (oData.Quantite > oData.StockDisponible) {
              MessageBox.warning("Stock insuffisant pour l'article sélectionné.");
              oData.Quantite = oData.StockDisponible;
              this.getView().getModel("newCommande").refresh(true);
            }
          }
          ,
          onArticleSelectionChange: function (oEvent) {
            var sSelectedId = oEvent.getSource().getSelectedKey();
            var oModel = this.getView().getModel(); // OData model
            var oCtx = oEvent.getSource().getBindingContext("newCommande"); // ligne d'article
        
            if (!sSelectedId || !oCtx) return;
        
            var sPath = "/ZCDS_article('" + sSelectedId + "')";
        
            oModel.read(sPath, {
                success: function (oData) {
                    oCtx.getModel().setProperty(oCtx.getPath() + "/Prixunitaire", oData.Prixunitaire);
                    oCtx.getModel().setProperty(oCtx.getPath() + "/Idarticle", oData.Idarticle);
                    oCtx.getModel().setProperty(oCtx.getPath() + "/Nomarticle", oData.Nomarticle);
                },
                error: function () {
                    MessageToast.show("Impossible de charger le prix de l'article");
                }
            });
        }
        
        
          
    });
});