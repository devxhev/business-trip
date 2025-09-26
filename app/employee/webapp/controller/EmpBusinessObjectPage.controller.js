sap.ui.define(
  [
    "sap/fe/core/PageController",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
  ],
  function (PageController, Fragment, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return PageController.extend(
      "at.clouddna.employee.view.EmpBusinessObjectPage",
      {
        _fragmentList: {},

        onInit: function () {
          const oEditModel = new JSONModel({ editMode: false });
          this.getView().setModel(oEditModel, "editModel");
          this._showBusinessFragment("EmpBusinessObjectPageDisplay");

          /* const router = this.getAppComponent().getRouter();
          router
            .getRoute("EmpBusinessObjectPage")
            .attachPatternMatched(this._onPatternMatched, this); */
          PageController.prototype.onInit.apply(this, arguments);
        },

        _onPatternMatched: function (oEvent) {
          /* setTimeout(() => {
            const oContext = this.getView().getBindingContext();

            if (!oContext) return;

            const bIsActive = oContext.getProperty("IsActiveEntity");

            if (bIsActive) {
              this._setEditableState(false);
            } else {
              this._setEditableState(true);
            }
          }, 200); */
        },

        formatStatusState: function (sStatus) {
          if (sStatus === "Neu") return "Information";
          if (
            sStatus === "Bereit zur Bearbeitung" ||
            sStatus === "In Bearbeitung"
          )
            return "Warning";
          if (sStatus === "Gebucht") return "Indication06";
          if (sStatus === "Abgeschlossen") return "Success";
          if (sStatus === "Storniert") return "Error";
          return "None";
        },

        _showBusinessFragment: function (fragmentName) {
          let page = this.getView().byId("EmpBusinessObjectPage");
          page.removeAllSections();
          if (!this._fragmentList[fragmentName]) {
            Fragment.load({
              id: this.getView().createId(fragmentName),
              name: "at.clouddna.employee.view.fragments." + fragmentName,
              controller: this,
            }).then(
              function (oFragment) {
                this._fragmentList[fragmentName] = oFragment;
                page.addSection(oFragment);
                return oFragment;
              }.bind(this)
            );
          } else {
            page.addSection(this._fragmentList[fragmentName]);
          }
        },

        _toggleEdit: function (bEdit) {
          let oEditModel = this.getView().getModel("editModel");
          oEditModel.setProperty("/editMode", bEdit);
          this._showBusinessFragment(
            bEdit ? "EmpBusinessObjectPageEdit" : "EmpBusinessObjectPageDisplay"
          );
        },

        formatFileSize: function (size) {
          if (size == null) return "";
          if (size < 1024) return size + " B";
          if (size < 1024 * 1024) return Math.round(size / 1024) + " KB";
          return Math.round(size / (1024 * 1024)) + " MB";
        },

        formatDateTime: function (v) {
          if (!v) return "";
          try {
            return new Date(v).toLocaleString();
          } catch (e) {
            return v;
          }
        },

        formatMessage: function (m) {
          if (!m) return "";
          return m.replace(/\n/g, "<br/>");
        },

        /**
         * Kommentar hinzufügen
         */
        onAddCommentPress: function () {
          /* const ctx = this.getView().getBindingContext();
          if (!ctx) return;

          if (!this._oCommentDialog) {
            this._oCommentDialog = new sap.m.Dialog({
              title: "Neuer Kommentar",
              contentWidth: "400px",
              contentHeight: "300px",
              resizable: true,
              content: [
                new sap.m.VBox({
                  items: [
                    new sap.m.Label({ text: "Nachricht:" }),
                    new sap.m.TextArea({
                      id: "commentTextArea",
                      rows: 5,
                      width: "100%",
                      placeholder: "Kommentar eingeben...",
                    }),
                  ],
                }),
              ],
              beginButton: new sap.m.Button({
                text: "Hinzufügen",
                type: "Emphasized",
                press: async () => {
                  const textArea = sap.ui.getCore().byId("commentTextArea");
                  const message = textArea.getValue();

                  if (!message.trim()) {
                    sap.m.MessageToast.show(
                      "Bitte geben Sie einen Kommentar ein"
                    );
                    return;
                  }

                  const model = this.getView().getModel();
                  const businessTripObj = ctx.getObject();
                  let draftPath = ctx.getPath();

                  try {
                    // Draft erzeugen, falls wir noch auf Active sind
                    if (businessTripObj.IsActiveEntity) {
                      const draftEditPath = `/BusinessTrip(ID='${businessTripObj.ID}',IsActiveEntity=true)/BusinessService.draftEdit(...)`;
                      await model.bindContext(draftEditPath).execute();
                      draftPath = `/BusinessTrip(ID='${businessTripObj.ID}',IsActiveEntity=false)`;
                    }

                    // Comment auf Draft erstellen
                    const commentsBinding = model.bindList(
                      draftPath + "/comments"
                    );
                    commentsBinding.create({
                      message: message.trim(),
                      createdBy: "current.user@example.com",
                      createdAt: new Date().toISOString(),
                    });

                    textArea.setValue("");
                    this._oCommentDialog.close();
                    sap.m.MessageToast.show("Kommentar hinzugefügt");
                  } catch (e) {
                    console.error("Comment creation failed:", e);
                    sap.m.MessageToast.show(
                      "Fehler beim Erstellen des Kommentars"
                    );
                  }
                },
              }),
              endButton: new sap.m.Button({
                text: "Abbrechen",
                press: () => {
                  sap.ui.getCore().byId("commentTextArea").setValue("");
                  this._oCommentDialog.close();
                },
              }),
            });
          }

          this._oCommentDialog.open(); */
        },

        /**
         * Datei-Upload
         */
        onUploadComplete: function (oEvent) {
          /* const file = oEvent.getParameter("files")[0];
          const ctx = this.getView().getBindingContext();
          if (!file || !ctx) {
            sap.m.MessageToast.show("Fehler beim Upload");
            return;
          }

          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const base64Content = reader.result.split(",")[1];
              const model = this.getView().getModel();
              const businessTripObj = ctx.getObject();
              let draftPath = ctx.getPath();

              // Draft erzeugen, falls wir noch auf Active sind
              if (businessTripObj.IsActiveEntity) {
                const draftEditPath = `/BusinessTrip(ID='${businessTripObj.ID}',IsActiveEntity=true)/BusinessService.draftEdit(...)`;
                await model.bindContext(draftEditPath).execute();
                draftPath = `/BusinessTrip(ID='${businessTripObj.ID}',IsActiveEntity=false)`;
              }

              // Attachment erstellen
              const attachmentsBinding = model.bindList(
                draftPath + "/attachments"
              );
              attachmentsBinding.create({
                fileName: file.name,
                description: `Uploaded: ${file.name}`,
                mediaType: file.type || "application/octet-stream",
                size: file.size,
                content: base64Content,
                createdBy: "current.user@example.com",
                createdAt: new Date().toISOString(),
              });

              sap.m.MessageToast.show(
                `Datei "${file.name}" erfolgreich hochgeladen`
              );
              oEvent.getSource().clear();
            } catch (e) {
              console.error("Upload failed:", e);
              sap.m.MessageToast.show("Fehler beim Upload: " + e.message);
            }
          };

          reader.onerror = () => {
            sap.m.MessageToast.show("Fehler beim Lesen der Datei");
          };

          reader.readAsDataURL(file); */
        },
        /**
         * Bearbeitungsmodus starten
         */
        onEdit: async function () {
          const oCtx = this.getView().getBindingContext();
          if (!oCtx) return;

          const obj = oCtx.getObject();
          if (!obj) return;

          try {
            if (obj.IsActiveEntity) {
              // editFlow nutzt intern draftEdit nur auf Root Active
              await this.editFlow.editDocument(oCtx);
            }
            this._toggleEdit(true);
            sap.m.MessageToast.show("Bearbeitungsmodus aktiv");
          } catch (e) {
            console.error("Edit failed:", e);
            sap.m.MessageToast.show(
              "Fehler beim Wechsel in den Bearbeitungsmodus"
            );
          }
        },

        onCancel: async function () {
          const oView = this.getView();
          const oCtx = oView.getBindingContext();
          if (!oCtx) return;

          try {
            await this.editFlow.cancelDocument(oCtx, {
              skipDiscardPopover: true,
              control: oView,
            });
            // Auf Rebinding warten, dann ist der Context wieder "IsActiveEntity=true"
            const oObjectBinding = oView.getObjectBinding();
            if (oObjectBinding) {
              await new Promise((resolve) =>
                oObjectBinding.attachEventOnce("change", resolve)
              );
            } else {
              // Fallback: nächste UI-Update-Runde abwarten
              await new Promise((r) => setTimeout(r, 0));
            }
          } catch (e) {
            MessageBox.error(e.message || "Cancel failed");
            return;
          }

          this._toggleEdit(false);

          MessageToast.show("Änderungen verworfen");
        },

        _validateAndPrepareAssociations: function (ctx) {
          const obj = ctx.getObject();
          const errors = [];
          if (!obj.employee?.ID) errors.push("Mitarbeiter fehlt");
          if (!obj.status?.ID) errors.push("Status fehlt");
          if (!obj.booking?.ID) errors.push("Booking fehlt");

          if (errors.length) {
            sap.m.MessageBox.error(errors.join("\n"));
            return false;
          }

          if (obj.employee?.ID) ctx.setProperty("employee_ID", obj.employee.ID);
          if (obj.status?.ID) ctx.setProperty("status_ID", obj.status.ID);
          if (obj.booking?.ID) ctx.setProperty("booking_ID", obj.booking.ID);

          return true;
        },

        onSave: async function () {
          const oView = this.getView();
          const oCtx = oView.getBindingContext();
          if (!oCtx) return;

          // Optional: eigene Validierung/Zuordnungen
          if (!this._validateAndPrepareAssociations(oCtx)) return;

          try {
            console.log("Saving", oCtx.getObject());
            await this.editFlow.saveDocument(oCtx, {
              control: oView,
            });

            const oObjectBinding = oView.getObjectBinding();
            if (oObjectBinding) {
              await new Promise((resolve) =>
                oObjectBinding.attachEventOnce("change", resolve)
              );
            }

            this._toggleEdit(false);
            sap.m.MessageToast.show("Gespeichert");
          } catch (e) {
            console.error("Save failed:", e);
            sap.m.MessageBox.error(e.message || "Fehler beim Speichern");
          }
        },
        onDeleteComment: function (oEvent) {
          const ctx = oEvent.getSource().getBindingContext();
          if (ctx) {
            ctx.delete().then(() => {
              sap.m.MessageToast.show("Kommentar gelöscht");
            });
          }
        },

        formatSwitchState: function (sValue) {
          return sValue === "X";
        },

        onNavBack: function () {
          const oHistory = sap.ui.core.routing.History.getInstance();
          const sPreviousHash = oHistory.getPreviousHash();

          if (sPreviousHash === undefined) {
            window.history.go(-1);
          } else {
            const oRouter = this.getAppComponent().getRouter();
            oRouter.navTo("BusinessTripList", {}, true);
          }
        },
      }
    );
  }
);
