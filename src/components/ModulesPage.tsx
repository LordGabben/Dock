import InventoryModule from './modules/InventoryModule';

export default function ModulesPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#F0F4F8' }}>
      <div className="flex-1 overflow-y-auto p-5">
        <InventoryModule />
      </div>
    </div>
  );
}
