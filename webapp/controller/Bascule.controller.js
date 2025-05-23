sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/ui/core/routing/History"
    ], function (Controller, JSONModel, MessageBox, MessageToast, History) {
        "use strict";
    
        return Controller.extend("projectsd.controller.Bascule", {
            onInit: function () {
                var oBasculeModel = new JSONModel({
                    Idbascule: "",
                    PoidsTare: "",
                    Poidsbrut: ""
                });
                this.getView().setModel(oBasculeModel, "newBascule");
    
                this._oODataModel = this.getOwnerComponent().getModel();
                this._setupSmartTable();
            },
    
            _setupSmartTable: function () {
                var oSmartTable = this.getView().byId("smartTableBascule");
                if (oSmartTable) {
                    oSmartTable.setInitiallyVisibleFields("Idbascule,PoidsTare,Poidsbrut");
                    oSmartTable.attachInitialise(() => {
                        const oTable = oSmartTable.getTable();
                        if (oTable.setMode) {
                            oTable.setMode("SingleSelectMaster");
                        }
                    });
                }
            },
    onAddBasculePress: function () {
          
        var oDialog = this.getView().byId("addBasculeDialog");
        this._generateNextIdBascule((nextId) => {
            // Injecter dans le modèle
            var oModel = this.getView().getModel("newBascule");
            oModel.setData({
                Idbascule: nextId,
                PoidsTare: "",
                Poidsbrut: ""
            });
            console.log("Poid :", oModel.getData());
            if (oDialog) {
                this.getView().addDependent(oDialog);
                oDialog.open();
            }
        });
},
    
            onSaveBascule: function () {
                var oModel = this._oODataModel;
                var oView = this.getView();
                var oNewData = oView.getModel("newBascule").getData();
    // Supprimer toute propriété erronée
delete oNewData.Poids;

                var oSmartTable = oView.byId("smartTableBascule");
    
                if (!oNewData.Idbascule || !oNewData.PoidsTare) {
                    MessageBox.error("Veuillez remplir les champs obligatoires.");
                    return;
                }
    
                sap.ui.core.BusyIndicator.show(0);
    
                if (this._sEditPath) {
                    oModel.update(this._sEditPath, oNewData, {
                        success: () => {
                            sap.ui.core.BusyIndicator.hide();
                            MessageToast.show("Bascule mise à jour.");
                            oView.byId("addBasculeDialog").close();
                            if (oSmartTable) oSmartTable.rebindTable();
                            this._sEditPath = null;
                        },
                        error: () => {
                            sap.ui.core.BusyIndicator.hide();
                            MessageBox.error("Erreur lors de la mise à jour.");
                        }
                    });
                } else {
                    console.log("data", oNewData);;
                    oModel.create("/ZCDS_Basculee2", oNewData, {
                        success: () => {
                            sap.ui.core.BusyIndicator.hide();
                            MessageToast.show("Bascule ajoutée.");
                            oView.byId("addBasculeDialog").close();
                            if (oSmartTable) oSmartTable.rebindTable();
                        },
                        error: () => {
                            sap.ui.core.BusyIndicator.hide();
                            MessageBox.error("Erreur lors de l'ajout.");
                        }
                    });
                }
            },
    
    onDeleteBasculePress: function () {
        var oSmartTable = this.getView().byId("smartTableBascule");
        var oTable = oSmartTable.getTable();
    
        if (!oTable || !oTable.getSelectedItem) {
            MessageBox.error("La table n'est pas accessible ou prête.");
            return;
        }
    
        var oSelectedItem = oTable.getSelectedItem();
        if (!oSelectedItem) {
            MessageBox.warning("Veuillez sélectionner une ligne à supprimer.");
            return;
        }
    
        var oContext = oSelectedItem.getBindingContext(); // Modèle principal
        if (!oContext) {
            MessageBox.error("Impossible de récupérer le contexte de la ligne sélectionnée.");
            return;
        }
    
        var sPath = oContext.getPath();
        console.log("Chemin de suppression :", sPath);
    
        MessageBox.confirm("Voulez-vous vraiment supprimer cette ligne ?", {
            title: "Confirmation de suppression",
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            onClose: (sAction) => {
                if (sAction === MessageBox.Action.YES) {
                    this._oODataModel.remove(sPath, {
                        success: () => {
                            MessageToast.show("Suppression réussie.");
                            oSmartTable.rebindTable();
                        },
                        error: (oError) => {
                            MessageBox.error("Erreur lors de la suppression : " + oError.message);
                        }
                    });
                }
            }
        });
    },
    

            onEditBasculePress: function () {
                var oSmartTable = this.getView().byId("smartTableBascule");
                var oTable = oSmartTable.getTable();
                var oSelectedItem = oTable.getSelectedItem();
    
                if (!oSelectedItem) {
                    MessageBox.warning("Veuillez sélectionner une ligne à modifier.");
                    return;
                }
    
                var oContext = oSelectedItem.getBindingContext();
                var oData = oContext.getObject();
    
                this.getView().getModel("newBascule").setData({
                    Idbascule: oData.Idbascule,
                    PoidsTare: oData.PoidsTare,
                    Poidsbrut: oData.Poidsbrut
                });
    
                this._sEditPath = oContext.getPath();
                this.getView().byId("addBasculeDialog").open();
            },
    
            _generateNextIdBascule: function (callback) {
                var oModel = this._oODataModel;
                oModel.read("/ZCDS_Basculee2", {
                    success: function (oData) {
                        var max = 0;
                        oData.results.forEach((item) => {
                            var match = item.Idbascule.match(/\d+$/);
                            if (match) {
                                var num = parseInt(match[0]);
                                if (num > max) max = num;
                            }
                        });
                        var nextId = "B" + String(max + 1).padStart(4, '0');
                        callback(nextId);
                    },
                    error: function () {
                        MessageBox.error("Erreur lors de la génération de l'ID.");
                    }
                });
            },
    
            onNavBack: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();
                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    sap.ui.core.UIComponent.getRouterFor(this).navTo("RouteAccueil", {}, true);
                }
            },
   
    onCancelDialog: function () {
        // Fermer le dialog
        var oDialog = this.getView().byId("addBasculeDialog");
        oDialog.close();
    
        // Réinitialiser le modèle pour éviter de garder les anciennes données
        this.getView().getModel("newBascule").setData({
            Idbascule: "",
            PoidsTare: "",
            Poidsbrut: ""
        });
    
        // Réinitialiser le mode édition
        this._sEditPath = null;
    }
    
            
        });
 });

    
    
    
    