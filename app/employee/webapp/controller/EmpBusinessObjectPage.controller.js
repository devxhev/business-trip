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
            return Fragment.load({
              id: this.getView().createId(fragmentName),
              name: "at.clouddna.employee.view.fragments." + fragmentName,
              controller: this,
            }).then(
              function (oFragment) {
                this._fragmentList[fragmentName] = oFragment;
                // Fragment ist bereits eine ObjectPageSection, direkt hinzufügen
                if (Array.isArray(oFragment)) {
                  oFragment.forEach((section) => page.addSection(section));
                } else {
                  page.addSection(oFragment);
                }
                return oFragment;
              }.bind(this)
            );
          } else {
            // Bereits geladene Fragmente hinzufügen
            if (Array.isArray(this._fragmentList[fragmentName])) {
              this._fragmentList[fragmentName].forEach((section) =>
                page.addSection(section)
              );
            } else {
              page.addSection(this._fragmentList[fragmentName]);
            }
            return Promise.resolve(this._fragmentList[fragmentName]);
          }
        },

        _toggleEdit: function (bEdit) {
          let oEditModel = this.getView().getModel("editModel");
          oEditModel.setProperty("/editMode", bEdit);
          return this._showBusinessFragment(
            bEdit ? "EmpBusinessObjectPageEdit" : "EmpBusinessObjectPageDisplay"
          ); /* .then(() => {
            if (bEdit) this._suspendResumeFlightSelects();
          }); */
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
            const d = new Date(v);
            if (Number.isNaN(d.getTime())) return String(v);
            return d.toLocaleString();
          } catch (e) {
            return String(v);
          }
        },

        formatMessage: function (m) {
          if (!m) return "";
          return m.replace(/\n/g, "<br/>");
        },

        /**
         * Kommentar hinzufügen
         */
        onAddCommentPress: async function () {
          const ctx = this.getView().getBindingContext();
          if (!ctx) return;

          const obj = ctx.getObject();
          if (!obj) return;

          // Draft erzeugen, falls wir noch auf Active sind (analog zu onEdit)
          try {
            if (obj.IsActiveEntity) {
              await this.editFlow.editDocument(ctx);
            }

            // Nach Edit-Mode wechseln für Kommentar-Eingabe

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

                    try {
                      // Comment über Draft-Context erstellen
                      const draftCtx = this.getView().getBindingContext();
                      const model = draftCtx.getModel();
                      const commentsBinding = model.bindList(
                        draftCtx.getPath() + "/comments"
                      );

                      const newComment = commentsBinding.create({
                        message: message.trim(),
                        createdBy: "current.user@example.com",
                        createdAt: new Date().toISOString(),
                      });

                      // Warten bis Kommentar erstellt wurde
                      await newComment.created();

                      textArea.setValue("");
                      this._oCommentDialog.close();
                      sap.m.MessageToast.show("Kommentar hinzugefügt");

                      try {
                        await this.editFlow.saveDocument(draftCtx, {
                          control: this.getView(),
                        });
                      } catch (sideEffectError) {
                        console.warn(
                          "SideEffect request failed:",
                          sideEffectError
                        );
                        // Fallback: Model refresh
                        model.refresh();
                      }
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

            this._oCommentDialog.open();
          } catch (e) {
            console.error("Edit preparation failed:", e);
            sap.m.MessageToast.show(
              "Fehler beim Vorbereiten der Kommentar-Eingabe"
            );
          }
        },
        onDeleteAttachment: async function (oEvent) {
          const oItem = oEvent.getParameter("listItem");
          if (!oItem) return;
          const oCtx = oItem.getBindingContext();
          if (!oCtx) return;

          try {
            await oCtx.delete();
            sap.m.MessageToast.show("Anhang gelöscht");
          } catch (e) {
            console.error("Delete attachment failed:", e);
            sap.m.MessageBox.error(
              e.message || "Fehler beim Löschen des Anhangs"
            );
          }
        },

        onEdit: async function () {
          const oCtx = this.getView().getBindingContext();
          if (!oCtx) return;

          const obj = oCtx.getObject();
          if (!obj) return;

          try {
            if (obj.IsActiveEntity) {
              await this.editFlow.editDocument(oCtx);
            }
            await this._toggleEdit(true);
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

          if (!this._validateAndPrepareAssociations(oCtx)) return;

          try {
            console.log("Saving", oCtx.getObject());
            await this.editFlow.saveDocument(oCtx, {
              control: oView,
            });

            this._toggleEdit(false);
            sap.m.MessageToast.show("Gespeichert");
          } catch (e) {
            console.error("Save failed:", e);
            sap.m.MessageBox.error(e.message || "Fehler beim Speichern");
          }
        },

        onDeleteComment: async function (oEvent) {
          const oItem = oEvent.getParameter("listItem");
          if (!oItem) return;
          const oCtx = oItem.getBindingContext();
          if (!oCtx) return;

          try {
            await oCtx.delete();
            sap.m.MessageToast.show("Kommentar gelöscht");
          } catch (e) {
            console.error("Delete comment failed:", e);
            sap.m.MessageBox.error(
              e.message || "Fehler beim Löschen des Kommentars"
            );
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

        _fb: function (fragmentId, localId) {
          const fragId = this.getView().createId(fragmentId);
          return Fragment.byId(fragId, localId);
        },

        onFileChange: async function (oEvent) {
          const oFileUploader = oEvent.getSource();
          const sValue = oFileUploader.getValue();

          if (!sValue) {
            return;
          }

          const oDomRef = oFileUploader.getDomRef();
          const oFile =
            oDomRef &&
            oDomRef.querySelector("input[type=file]") &&
            oDomRef.querySelector("input[type=file]").files[0];

          if (!oFile) {
            sap.m.MessageToast.show("Keine Datei ausgewählt");
            return;
          }

          const ctx = this.getView().getBindingContext();
          if (!ctx) {
            sap.m.MessageToast.show("Fehler beim Upload - kein Context");
            return;
          }

          try {
            const obj = ctx.getObject();
            let draftCtx = ctx;

            if (obj && obj.IsActiveEntity) {
              await this.editFlow.editDocument(ctx);
              draftCtx = this.getView().getBindingContext();
            }

            if (!draftCtx) {
              sap.m.MessageToast.show(
                "Draft-Context konnte nicht erstellt werden"
              );
              return;
            }

            const reader = new FileReader();
            reader.onload = async () => {
              try {
                const base64Content = reader.result.split(",")[1];
                const model = draftCtx.getModel();

                const attachmentsBinding = model.bindList(
                  draftCtx.getPath() + "/attachments"
                );

                const newAttachment = attachmentsBinding.create({
                  fileName: oFile.name,
                  description: `Uploaded: ${oFile.name}`,
                  mediaType: oFile.type || "application/octet-stream",
                  size: oFile.size,
                  content: base64Content,
                  // createdBy/createdAt werden automatisch von @managed gesetzt
                });

                // Warten bis erstellt
                await newAttachment.created();
                console.log("Attachment created:", newAttachment);

                sap.m.MessageToast.show(
                  `Datei "${oFile.name}" erfolgreich hochgeladen`
                );
                oFileUploader.clear();

                // SideEffects für sofortige Anzeige
                try {
                  await this.editFlow.saveDocument(draftCtx);
                } catch (sideEffectError) {
                  console.warn("SideEffect request failed:", sideEffectError);
                  model.refresh();
                }
              } catch (e) {
                console.error("Upload failed:", e);
                sap.m.MessageToast.show("Fehler beim Upload: " + e.message);
              }
            };

            reader.onerror = () => {
              sap.m.MessageToast.show("Fehler beim Lesen der Datei");
            };

            reader.readAsDataURL(oFile);
          } catch (e) {
            console.error("Upload preparation failed:", e);
            sap.m.MessageToast.show("Fehler beim Vorbereiten des Uploads");
          }
        },
      }
    );
  }
);
